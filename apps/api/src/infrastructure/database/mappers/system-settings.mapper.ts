import { SystemSettings } from '../../../domain/entities/system-settings.entity';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { SystemSettingsDto } from '@libreriard/shared';
import { Document } from 'mongodb';

export class SystemSettingsMapper {
  public static toDomain(doc: Document): SystemSettings {
    return new SystemSettings({
      id: BsonUuidHelper.fromBsonUuid(doc._id),
      bankTransferDetails: doc.bankTransferDetails,
      termsAndConditions: doc.termsAndConditions || '',
      privacyPolicy: doc.privacyPolicy || '',
      footerContact: doc.footerContact || {
        address: 'Av. Corrientes 1234, CABA',
        googleMapsUrl: 'https://maps.google.com/?q=Libreria+Ruben+Dario',
        schedule: 'Lunes a Viernes de 8:30 a 19:30 hs. Sábados de 9:00 a 13:30 hs.',
        email: 'contacto@libreriard.com.ar',
        phone: '+54 11 4567-8900'
      },
      catalogMetadata: doc.catalogMetadata || {
        categories: ['Escolar', 'Comercial', 'Artística', 'Cuadernos', 'Escritura', 'Papelería'],
        tags: ['cuaderno', 'tapa dura', 'rayado', 'cuadriculado', 'resma', 'a4', 'lapices', 'birome', 'oferta']
      },
      updatedAt: doc.updatedAt,
      updatedBy: doc.updatedBy ? BsonUuidHelper.fromBsonUuid(doc.updatedBy) : undefined
    });
  }

  public static toPersistence(entity: SystemSettings): Document {
    return {
      _id: BsonUuidHelper.toBsonUuid(entity.id),
      bankTransferDetails: entity.bankTransferDetails,
      termsAndConditions: entity.termsAndConditions,
      privacyPolicy: entity.privacyPolicy,
      footerContact: entity.footerContact,
      catalogMetadata: entity.catalogMetadata,
      updatedAt: entity.updatedAt,
      updatedBy: entity.updatedBy ? BsonUuidHelper.toBsonUuid(entity.updatedBy) : null
    };
  }

  public static toDto(entity: SystemSettings): SystemSettingsDto {
    return {
      bankTransferDetails: entity.bankTransferDetails,
      termsAndConditions: entity.termsAndConditions,
      privacyPolicy: entity.privacyPolicy,
      footerContact: entity.footerContact,
      catalogMetadata: entity.catalogMetadata,
      updatedAt: entity.updatedAt.toISOString(),
      updatedBy: entity.updatedBy ? entity.updatedBy.toString() : undefined
    };
  }
}
