import { describe, it, expect } from 'vitest';
import { UUIDv7 } from '../../src/domain/value-objects/uuid-v7.vo';
import { Email } from '../../src/domain/value-objects/email.vo';
import { Money } from '../../src/domain/value-objects/money.vo';
import { OrderNumber } from '../../src/domain/value-objects/order-number.vo';

describe('Domain Value Objects', () => {
  describe('UUIDv7', () => {
    it('should generate a valid UUIDv7', () => {
      const id = UUIDv7.generate();
      expect(UUIDv7.isValid(id.toString())).toBe(true);
      expect(id.toString()).toHaveLength(36);
    });

    it('should compare equality between UUIDs correctly', () => {
      const id1 = UUIDv7.generate();
      const id2 = UUIDv7.fromString(id1.toString());
      expect(id1.equals(id2)).toBe(true);
    });

    it('should throw error on invalid UUID string', () => {
      expect(() => UUIDv7.fromString('not-a-uuid')).toThrow();
    });
  });

  describe('Email', () => {
    it('should normalize email to lowercase and trim spaces', () => {
      const email = Email.create('  Ruben.Dario@LibreriaRD.COM.AR  ');
      expect(email.toValue()).toBe('ruben.dario@libreriard.com.ar');
    });

    it('should reject invalid email strings', () => {
      expect(() => Email.create('invalid-email')).toThrow();
    });
  });

  describe('Money', () => {
    it('should round monetary amounts to 2 decimal places', () => {
      const money = Money.from(125.456);
      expect(money.getAmount()).toBe(125.46);
    });

    it('should reject negative amounts', () => {
      expect(() => Money.from(-10)).toThrow();
    });

    it('should correctly add and multiply money values', () => {
      const m1 = Money.from(100.50);
      const m2 = Money.from(49.50);
      expect(m1.add(m2).getAmount()).toBe(150);
      expect(m1.multiply(2).getAmount()).toBe(201);
    });
  });

  describe('OrderNumber', () => {
    it('should generate human-readable order number with RD prefix', () => {
      const orderNum = OrderNumber.generate();
      expect(orderNum.toValue()).toMatch(/^RD-\d{6}-[2-9A-Z]{5}$/);
    });
  });
});
