import { describe, it, expect } from 'vitest';
import { UUIDv7 } from '../../src/domain/value-objects/uuid-v7.vo';
import { BsonUuidHelper } from '../../src/infrastructure/database/bson-uuid.helper';
import { BSON } from 'mongodb';

describe('BsonUuidHelper', () => {
  it('should convert UUIDv7 to MongoDB BSON.UUID with subtype 4', () => {
    const vo = UUIDv7.generate();
    const bsonUuid = BsonUuidHelper.toBsonUuid(vo);

    expect(bsonUuid).toBeInstanceOf(BSON.UUID);
    expect(bsonUuid.sub_type).toBe(4);
    expect(bsonUuid.toString()).toBe(vo.toString());
  });

  it('should convert BSON.UUID back to UUIDv7 accurately', () => {
    const original = UUIDv7.generate();
    const bson = new BSON.UUID(original.toString());
    const restored = BsonUuidHelper.fromBsonUuid(bson);

    expect(restored.equals(original)).toBe(true);
  });
});

