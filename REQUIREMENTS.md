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
  - `ADMIN`: Full access to create/update/delete staff, reset staff passwords, view audit logs, manage system settings (bank details), approve wholesale requests, and manage products/customers/orders.
  - `EMPLOYEE`: Access to manage products, customers, and orders. Cannot manage other staff, view audit logs, or edit bank settings.

#### Customer (`CustomerUser`)
- `_id`: UUIDv7 (BSON Binary Subtype 4)
- `name`: string (Persona o Razón Social)
- `cuitCuil`: string (Unique, validated Argentine CUIL/CUIT format)
- `email`: string (Unique, normalized lowercase)
- `passwordHash`: string (bcrypt)
- `phone`: string (optional)
- `address`: string (optional)
- `postalCode`: string (optional)
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

### 4.3 Products & Catalog (`Product`)
- `_id`: UUIDv7 (BSON Binary Subtype 4)
- `name`: string
- `description`: string
- `barcode`: string (código de barras, indexed)
- `retailPrice`: number (precio minorista)
- `wholesalePrice`: number (precio mayorista)
- `images`: array of Cloudinary image objects `{ url, publicId, isPrimary }`
- `subTypes`: array of variants `{ id, name, sku, priceModifier, barcode }`
- `supplier`: string (proveedor)
- `categories`: array of strings (e.g., `["Escolar", "Cuadernos"]`)
- `tags`: array of strings (e.g., `["oferta", "rayado", "a4"]`)
- `isActive`: boolean (default: `true`)
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
  - `unitPrice`: number
  - `quantity`: number
  - `subtotal`: number
- `subtotal`: number
- `discount`: number
- `total`: number
- `paymentMethod`: `TRANSFERENCIA` | `EFECTIVO` | `MERCADOPAGO` | `OTRO`
- `deliveryMethod`: `RETIRO_LOCAL` | `ENVIO_DOMICILIO`
- `deliveryAddress`: string (optional)
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
  - `notes`: string (Instrucciones para enviar comprobante)
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

1. **Tokens**:
   - Access Token: JWT containing `sub` (userId), `role`, `type` (`staff` or `customer`), valid for **15 minutes**.
   - Refresh Token: Stored securely (`httpOnly`, `sameSite: 'lax'`, `secure` in production cookie, and indexed in database for revocation capability), valid for **7 days**.
   - Refresh flow: When access token expires, frontend interceptor triggers `POST /api/v1/auth/refresh` with refresh cookie, receiving a fresh access token without user friction.
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
   - Triggered upon customer registration. Contains a secure one-time activation token link pointing to `libreriard.com.ar/activar-cuenta?token=...`. Account cannot log in until verified.
2. **Customer Password Reset**:
   - Triggered when customer requests password recovery. Link points to `libreriard.com.ar/recuperar-clave?token=...`.
3. **Order Confirmation**:
   - Triggered when order is created. Includes order number, itemized summary, totals, delivery method, and bank transfer details (if `TRANSFERENCIA`).
4. **Wholesale Request Notification**:
   - Triggered when a customer requests wholesale status in profile. Sent to configured administrator email notification inbox.

---

## 7. Cloudinary Media Storage

- Staff can upload high-resolution product images.
- Images are optimized, transformed, and securely uploaded to Cloudinary, storing the secure HTTPS URL and `public_id` for deletion/management.

---

## 8. Frontend User Experience (Mobile-First)

### Staff Panel (`staff.libreriard.com.ar`):
- Responsive sidebar navigation (collapsible on mobile).
- Dashboard: quick KPIs (orders pending, sales total, active products, wholesale requests pending).
- Product Catalog & Editor: barcode scanner support, variant/sub-type editor, image uploader, price inputs (retail & wholesale).
- Orders Management: quick filter tabs by status, modal with complete order details and status change trigger with automatic audit log.
- Customers Directory: search by CUIT/CUIL, name or email; badge for Wholesale pending with 1-click approval modal.
- Staff Management (Admin only): create staff member, assign role, reset password, deactivate/delete.
- System Settings (Admin only): manage Bank Transfer CBU/Alias details.
- Audit Log Inspector (Admin only): filterable by tag, entity type, actor, with visual JSON diff viewer.

### Customer Store (`libreriard.com.ar`):
- Public Catalog: accessible without login, search bar with debounce, category and tag filters.
- Responsive Product Cards: displaying appropriate price (retail by default; wholesale if customer logged in and approved for wholesale).
- Product Details Modal / Page: image carousel, variant selection, stock/sub-type pricing.
- Mobile Cart & Checkout: item counter, order summary, delivery method selector, payment method selector (with dynamic bank transfer instructions display).
- Customer Portal:
  - Registration with CUIL/CUIT validation.
  - Activation confirmation feedback.
  - Profile view with order history and status timeline.
  - Wholesale upgrade request form with optional notes.
  - Forgot password / reset password workflow.
