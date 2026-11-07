# Librería Rubén Darío - Project Specification & Architecture (REQUIREMENTS)

This document serves as the single source of truth for the technical design, domain models, business logic, architectural patterns, and implementation standards for **Librería Rubén Darío**.

---

## 1. Project Overview & Identity

- **Name**: Librería Rubén Darío
- **Domain**: Bookstore and stationery store (librería escolar, comercial y artística) selling both retail (minorista) and wholesale (mayorista).
- **Brand Palette & Identity**:
  - Primary Brand Accent: `#00D9FF` (Electric Cyan / Aqua Blue - extracted from official brand logo `assets/logo.png`).
  - Dark Primary / Neutral: `#000000` / `#0F172A` (Rich Black / Slate Dark).
  - Surface Backgrounds: `#F8FAFC` (Light Slate), `#FFFFFF` (Card Clean White), `#0B132B` / `#1E293B` (Dark Panels).
  - Semantic Status:
    - Success: `#10B981` (Emerald Green - active accounts, confirmed orders).
    - Warning: `#F59E0B` (Amber - pending approval, wholesale requests).
    - Danger: `#EF4444` (Rose Red - cancelled orders, deletion alerts).
    - Info: `#0284C7` (Sky Blue - informational notices).

---

## 2. Infrastructure & URLs

| Subproject | Directory | Dev URL | Production URL |
| :--- | :--- | :--- | :--- |
| **Backend API** | `apps/api` | `http://localhost:5000` | `https://api.libreriard.com.ar` |
| **Staff Frontend** | `apps/staff` | `http://localhost:5001` | `https://staff.libreriard.com.ar` |
| **Customer Frontend** | `apps/customer` | `http://localhost:5002` | `https://libreriard.com.ar` |
| **Shared Library** | `packages/shared` | N/A (Internal Workspace) | N/A |

Package Manager: **pnpm** (Monorepo with `pnpm-workspace.yaml`).

---

## 3. Architectural Principles & Patterns

The codebase strictly adheres to the following principles:
- **Language Convention**:
  - Code identifiers, classes, methods, database fields, domain models, and comments are written in **English**.
  - All user-facing texts, validation error messages, email contents, and UI components are in **Spanish**.
- **SOLID Principles**:
  - **Single Responsibility Principle (SRP)**: Each class/module handles exactly one responsibility.
  - **Open/Closed Principle (OCP)**: Interfaces and strategies allow extending behavior without modifying existing classes.
  - **Liskov Substitution Principle (LSP)**: Concrete repositories and services fully honor their interface contracts.
  - **Interface Segregation Principle (ISP)**: Granular interfaces for repositories, authenticators, and notifiers.
  - **Dependency Inversion Principle (DIP)**: Application use-cases depend on abstractions, with implementations injected via factories or composition roots.
- **Code Organization & 100-Line Guideline**:
  - All core logic is encapsulated within classes.
  - Target maximum of ~100 lines per file for optimal maintainability, readability, and decoupling.
- **Patterns Used**:
  - **GoF (Gang of Four)**:
    - *Factory Method / Abstract Factory*: `UserFactory`, `ProductFactory`, `OrderFactory`, `AuditLogFactory`.
    - *Strategy Pattern*: `PasswordHasherStrategy`, `PaymentCalculationStrategy`.
    - *Observer / Event Bus*: `DomainEventPublisher` notifying email service and audit loggers asynchronously.
    - *Adapter*: Resend Email Adapter, Cloudinary Storage Adapter.
  - **PEAA (Patterns of Enterprise Application Architecture)**:
    - *Data Mapper*: Decouples Domain Entities from MongoDB BSON documents.
    - *Repository Pattern*: Clean collection-like interfaces for persistence.
    - *Value Objects*: `UUIDv7`, `Email`, `Money`, `CuitCuil`, `OrderNumber`.
    - *Service Layer*: Dedicated use-case orchestrators.
    - *Identity Map / Unit of Work*: Managed transactions when coordinating multi-document updates.
  - **POSAD (Pattern-Oriented Software Architecture)**:
    - Strict 4-layer architecture: Domain -> Application -> Infrastructure -> Presentation.

---

## 4. Domain Model & Entities

### 4.1 Identifiers: UUIDv7
- All entity primary keys `_id` are RFC 9562 **UUIDv7** (time-ordered, 128-bit).
- Persistence: Stored as native MongoDB BSON **Binary Subtype 4** (`BSON.UUID` / `BinData(4, ...)`), avoiding raw strings in the database while exposing canonical string format in API DTOs.

### 4.2 User Management & Authentication

#### Staff (`StaffUser`)
- `_id`: UUIDv7 (BSON Binary Subtype 4)
- `name`: string
- `email`: string (Unique, normalized lowercase)
- `passwordHash`: string (bcrypt)
- `role`: `ADMIN` | `EMPLOYEE`
- `isActive`: boolean
- `createdAt`: Date
- `updatedAt`: Date
- **Permissions**:
  - `ADMIN`: Full access to create/update/delete staff, reset staff passwords, view audit logs, manage system settings (bank details, contact/footer info, legal texts), manage customer accounts (edit details, reset customer passwords, toggle active status), approve wholesale requests, and manage products/orders.
  - `EMPLOYEE`: Access to manage products, categories, tags, and orders. Cannot manage other staff, customer accounts, view audit logs, or edit system settings.

#### Customer (`CustomerUser`)
- `_id`: UUIDv7 (BSON Binary Subtype 4)
- `name`: string (Persona o Razón Social)
- `cuitCuil`: string (Unique, validated Argentine CUIL/CUIT format)
- `email`: string (Unique, normalized lowercase)
- `passwordHash`: string (bcrypt)
- `phone`: string (optional)
- `address`: string (optional)
- `postalCode`: string (optional)
- `isActive`: boolean (default: `true`, can be deactivated by Admin)
- `isWholesaleApproved`: boolean (default: `false` -> Retail customer)
- `wholesaleRequest`:
  - `requestedAt`: Date (optional)
  - `message`: string (optional)
  - `status`: `NONE` | `PENDING` | `APPROVED` | `REJECTED`
- `isEmailVerified`: boolean (default: `false`)
- `verificationToken`: string (optional)
- `verificationTokenExpiresAt`: Date (optional)
- `passwordResetToken`: string (optional)
- `passwordResetTokenExpiresAt`: Date (optional)
- `createdAt`: Date
- `updatedAt`: Date
- **Registration Agreement**: Customers must accept Terms & Conditions and Privacy Policy upon registration.

### 4.3 Products & Catalog (`Product`)
- `_id`: UUIDv7 (BSON Binary Subtype 4)
- `name`: string (Mandatory)
- `description`: string (optional)
- `barcode`: string (optional, barcode scanner support)
- `retailPrice`: number (optional; base retail price, if not set product cannot be added to retail orders)
- `wholesalePrice`: number (optional; if not set, product cannot be added to wholesale orders)
- `retailPriceTiers`: array of `{ minQuantity: number, unitPrice: number }` (Escalas minoristas por volumen; permite descuentos automáticos por cantidad)
- `images`: array of Cloudinary image objects `{ url, publicId, isPrimary }` (pueden ser eliminadas con sincronización a Cloudinary)
- `subTypes`: array of variants `{ id, name, sku, priceModifier, barcode }`
- `supplier`: string (proveedor)
- `categories`: array of strings linked via Catalog Metadata
- `tags`: array of strings linked via Catalog Metadata
- `isActive`: boolean (default: `true`, can be toggled by Staff)
- `createdAt`: Date
- `updatedAt`: Date

### 4.4 Orders (`Order`)
- `_id`: UUIDv7 (BSON Binary Subtype 4)
- `orderNumber`: string (Unique, human-readable, e.g. `RD-202611-0001`)
- `orderType`: `RETAIL` | `WHOLESALE`
- `customerId`: UUIDv7
- `customerSnapshot`: `{ name, cuitCuil, email, phone, address, postalCode }`
- `items`: array of:
  - `productId`: UUIDv7
  - `productName`: string
  - `subTypeId`: string (optional)
  - `subTypeName`: string (optional)
  - `unitPrice`: number (precio unitario efectivo cobrado)
  - `originalUnitPrice`: number (opcional; precio unitario base si aplicó escala de descuento)
  - `discountApplied`: boolean (indica si aplicó descuento por cantidad en precio minorista)
  - `quantity`: number
  - `subtotal`: number
- `subtotal`: number
- `discount`: number
- `total`: number
- `paymentMethod`: `TRANSFERENCIA` | `EFECTIVO` | `TARJETA_DEBITO` | `TARJETA_CREDITO` | `CUENTA_CORRIENTE` | `OTRO`
- `deliveryMethod`: `RETIRO_LOCAL` | `ENVIO_DOMICILIO`
- `deliveryAddress`: string (optional)
- `transferReceiptUrl`: string (optional, mandatory for `TRANSFERENCIA`)
- `transferReceiptName`: string (optional, original filename)
- `status`: `PENDING` | `CONFIRMED` | `PREPARING` | `READY` | `DELIVERED` | `CANCELLED`
- `notes`: string (optional)
- `createdAt`: Date
- `updatedAt`: Date

### 4.5 System Settings (`SystemSetting`)
Configurable by Administrator in staff panel:
- `bankTransferDetails`:
  - `bankName`: string (e.g., Banco Galicia)
  - `accountHolder`: string (Titular de la cuenta)
  - `cuitCuil`: string
  - `cbu`: string (22 dígitos)
  - `alias`: string
  - `accountType`: string (e.g., Cuenta Corriente Especial)
  - `notes`: string (Instrucciones para transferir)
- `termsAndConditions`: string (Términos y Condiciones de uso del sitio)
- `privacyPolicy`: string (Políticas de privacidad y protección de datos)
- `footerContact`:
  - `address`: string (Dirección física del local)
  - `googleMapsUrl`: string (Enlace directo a Google Maps)
  - `schedule`: string (Horarios de atención)
  - `email`: string (Correo electrónico de contacto)
  - `phone`: string (Teléfono o WhatsApp de atención)
- `catalogMetadata`:
  - `categories`: string[]
  - `tags`: string[]
- `updatedBy`: UUIDv7
- `updatedAt`: Date

### 4.6 Audit Logs (`AuditLog`)
- Dedicated collection: `audit_logs`
- Logged on every mutation across the system (staff, customer, or background event).
- Fields:
  - `_id`: UUIDv7 (BSON Binary Subtype 4)
  - `actor`:
    - `id`: string / UUID
    - `name`: string
    - `email`: string
    - `role`: string (`ADMIN` | `EMPLOYEE` | `CUSTOMER` | `SYSTEM`)
    - `ip`: string
  - `action`: string (e.g. `PRODUCT_CREATED`, `ORDER_STATUS_UPDATED`, `WHOLESALE_APPROVED`)
  - `entity`:
    - `type`: string (`Product`, `Order`, `StaffUser`, `CustomerUser`, `Setting`)
    - `id`: string
  - `changes`:
    - `before`: object / null
    - `after`: object / null
  - `tags`: array of strings (`["PRODUCT", "PRICE"]`, `["ORDER", "STATUS"]`, etc.)
  - `timestamp`: Date
- Read permissions: **Admin staff only**.

---

## 5. Security & Session Management

1. **Tokens & Multi-Tenant Cookie Isolation**:
   - Access Token: JWT containing `sub` (userId), `email`, `userType` (`STAFF` or `CUSTOMER`), `role` (for staff: `ADMIN` | `EMPLOYEE`), and `isWholesaleApproved` (for customers), valid for **15 minutes**.
   - Token Sanitization: When signing new tokens, payloads are strictly sanitized to never retain `iat` or `exp` properties from decoded tokens, preventing jsonwebtoken `options.expiresIn` exceptions.
   - Refresh Token Isolation:
     - Staff uses distinct cookie `staffRefreshToken` and header/cookie fallback.
     - Customer uses distinct cookie `customerRefreshToken` and header/cookie fallback.
     - Prevents cookie collision when developing across different ports on `localhost` (5001 vs 5002) and ensures strict audience validation (staff endpoints reject customer tokens and vice versa).
   - Frontend Token Persistence: Frontends maintain the active access token backed by `sessionStorage` (`rd_staff_access_token` and `rd_customer_access_token`) so sessions remain immediately available on page reload without unnecessary unauthenticated roundtrips. Automatic refresh interceptor retries on both 401 and 403.
2. **Access Control Middleware**:
   - `AuthenticateMiddleware`: Validates JWT token from Bearer header.
   - `RequireStaffMiddleware`: Ensures user is authenticated staff (`ADMIN` or `EMPLOYEE`).
   - `RequireAdminMiddleware`: Ensures user role is strictly `ADMIN`.
   - `RequireCustomerMiddleware`: Ensures user is an authenticated customer.
3. **Data Sanitization & Injection Defense**:
   - Zod schemas validating all incoming request payloads.
   - Helmet for HTTP security headers.
   - CORS configured specifically for `api.libreriard.com.ar`, `staff.libreriard.com.ar`, and `libreriard.com.ar`.

---

## 6. Email Service (Resend)

1. **Customer Account Activation**:
   - Triggered upon customer registration. Contains a secure one-time activation token link pointing to `libreriard.com.ar/activate-account?token=...`. Account cannot log in until verified.
2. **Customer Password Reset**:
   - Triggered when customer requests password recovery. Link points to `libreriard.com.ar/reset-password?token=...`.
3. **Order Confirmation**:
   - Triggered when order is created. Includes order number, itemized summary, totals, delivery method, and bank transfer details (if `TRANSFERENCIA`).
4. **Wholesale Request Notification**:
   - Triggered when a customer requests wholesale status in profile. Sent to configured administrator email notification inbox.

---

## 7. Cloudinary Media Storage

- Staff can upload high-resolution product images.
- Images are optimized, transformed, and securely uploaded to Cloudinary, storing the secure HTTPS URL and `public_id` for deletion/management.
- When an image is removed in the product editor, it is immediately deleted from Cloudinary via `DELETE /upload/image/:publicId`.

---

## 8. Frontend User Experience (Mobile-First & English Subroutes)

### Staff Panel (`staff.libreriard.com.ar`):
- Responsive sidebar navigation (collapsible on mobile).
- Subroutes (in English):
  - `/`: Panel Principal (Dashboard)
  - `/products`: Catálogo de Productos y Editor (con escalas minoristas por cantidad y eliminación de fotos sincronizada)
  - `/orders`: Gestión de Órdenes (con estados, tipos y métodos de pago en español)
  - `/customers`: Gestión de Clientes (con edición, reseteo de claves y activación/desactivación)
  - `/staff`: Gestión de Personal Staff (Admin only)
  - `/settings`: Configuración (Admin only - Datos bancarios, Ubicación/Contacto y Textos Legales)
  - `/audit-logs`: Auditoría y Logs del Sistema (Admin only)

### Customer Store (`libreriard.com.ar`):
- Subroutes (in English):
  - `/`: Catálogo público
  - `/cart`: Carrito de compras (con cálculo automático de escalas de descuento minorista y botón "Vaciar Carrito")
  - `/order-success`: Confirmación de orden con instrucciones y comprobante
  - `/login`: Inicio de sesión
  - `/register`: Registro de clientes con aceptación de términos y políticas
  - `/activate-account`: Activación de cuenta por token
  - `/forgot-password`: Solicitud de restablecimiento de contraseña
  - `/reset-password`: Formulario de cambio de contraseña
  - `/profile`: Perfil del cliente con historial de pedidos e indicador de escalas aplicadas
  - `/terms-and-conditions`: Términos y condiciones
  - `/privacy-policy`: Política de privacidad
- All UI text, badges, order statuses, and messages strictly displayed in **Spanish**.

