import { v7 as uuidv7, validate } from 'uuid';

export class UUIDv7 {
  private readonly value: string;

  constructor(value?: string) {
    if (value) {
      if (!validate(value)) {
        throw new Error(`Identificador UUID inválido: ${value}`);
      }
      this.value = value.toLowerCase();
    } else {
      this.value = uuidv7();
    }
  }

  public static generate(): UUIDv7 {
    return new UUIDv7();
  }

  public static fromString(value: string): UUIDv7 {
    return new UUIDv7(value);
  }

  public static isValid(value: string): boolean {
    return typeof value === 'string' && validate(value);
  }

  public toString(): string {
    return this.value;
  }

  public toValue(): string {
    return this.value;
  }

  public equals(other: UUIDv7): boolean {
    if (!other) return false;
    return this.value === other.toValue();
  }
}
