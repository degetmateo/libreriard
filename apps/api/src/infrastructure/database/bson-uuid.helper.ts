import { BSON } from 'mongodb';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.vo';

export class BsonUuidHelper {
  public static toBsonUuid(uuid: UUIDv7): BSON.UUID {
    return new BSON.UUID(uuid.toString());
  }

  public static fromBsonUuid(raw: any): UUIDv7 {
    if (!raw) {
      throw new Error('Identificador BSON UUID nulo o indefinido');
    }
    if (typeof raw.toUUID === 'function') {
      return UUIDv7.fromString(raw.toUUID().toString());
    }
    if (typeof raw.toString === 'function') {
      return UUIDv7.fromString(raw.toString());
    }
    if (typeof raw === 'string') {
      return UUIDv7.fromString(raw);
    }
    throw new Error(`Tipo de dato inválido para BSON UUID: ${typeof raw}`);
  }
}
