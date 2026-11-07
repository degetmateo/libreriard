import { ISystemSettingsRepository } from '../../../domain/repositories/system-settings.repository.interface';
import { SystemSettings } from '../../../domain/entities/system-settings.entity';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.vo';
import { MongoClient } from '../mongo-client';
import { SystemSettingsMapper } from '../mappers/system-settings.mapper';

export class MongoSystemSettingsRepository implements ISystemSettingsRepository {
  private get collection() {
    return MongoClient.getInstance().getCollection('system_settings');
  }

  public async getSettings(): Promise<SystemSettings> {
    const doc = await this.collection.findOne({});
    if (doc) {
      return SystemSettingsMapper.toDomain(doc);
    }

    const defaultSettings = new SystemSettings({
      id: UUIDv7.generate(),
      bankTransferDetails: {
        bankName: 'Banco Santander',
        accountHolder: 'Librería Rubén Darío S.R.L.',
        cuitCuil: '30-71234567-8',
        cbu: '0720123488000012345678',
        alias: 'LIBRERIA.RUBEN.DARIO',
        accountType: 'Cuenta Corriente Especial en Pesos',
        notes: 'Por favor adjunte el comprobante de transferencia al confirmar su orden.'
      },
      termsAndConditions: `### Términos y Condiciones de Compra - Librería Rubén Darío\n\n1. **Condiciones Generales**: Al registrarse y realizar pedidos en Librería Rubén Darío, el cliente acepta los presentes términos.\n2. **Precios y Facturación**: Los precios publicados se encuentran en pesos argentinos. Los pedidos mayoristas están sujetos a aprobación previa.\n3. **Pagos por Transferencia**: Las órdenes abonadas por transferencia bancaria requieren el adjunto del comprobante correspondiente para su preparación.\n4. **Retiro y Envíos**: Los pedidos confirmados podrán retirarse en el local o despacharse a domicilio según la opción seleccionada.`,
      privacyPolicy: `### Política de Privacidad - Librería Rubén Darío\n\n1. **Protección de Datos**: Los datos personales suministrados (nombre, CUIT/CUIL, correo, teléfono y dirección) se utilizan exclusivamente para procesar compras y notificaciones del servicio.\n2. **Confidencialidad**: No compartimos ni comercializamos su información con terceros bajo ninguna circunstancia.\n3. **Seguridad**: Sus credenciales de acceso se encuentran encriptadas de forma irreversible.`,
      footerContact: {
        address: 'Av. Corrientes 1234, Ciudad Autónoma de Buenos Aires',
        googleMapsUrl: 'https://maps.google.com/?q=Av+Corrientes+1234+Buenos+Aires',
        schedule: 'Lunes a Viernes de 8:30 a 19:30 hs. Sábados de 9:00 a 13:30 hs.',
        email: 'contacto@libreriard.com.ar',
        phone: '+54 11 4567-8900'
      },
      catalogMetadata: {
        categories: ['Escolar', 'Comercial', 'Artística', 'Cuadernos', 'Escritura', 'Papelería'],
        tags: ['cuaderno', 'tapa dura', 'rayado', 'cuadriculado', 'resma', 'a4', 'lapices', 'birome', 'oferta']
      },
      updatedAt: new Date()
    });

    await this.save(defaultSettings);
    return defaultSettings;
  }

  public async save(settings: SystemSettings): Promise<void> {
    const doc = SystemSettingsMapper.toPersistence(settings);
    await this.collection.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
  }
}
