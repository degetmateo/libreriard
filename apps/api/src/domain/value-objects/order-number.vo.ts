export class OrderNumber {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('El número de orden no puede estar vacío');
    }
    this.value = value.trim().toUpperCase();
  }

  public static generate(): OrderNumber {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return new OrderNumber(`RD-${yearMonth}-${randomPart}`);
  }

  public static fromString(value: string): OrderNumber {
    return new OrderNumber(value);
  }

  public toString(): string {
    return this.value;
  }

  public toValue(): string {
    return this.value;
  }

  public equals(other: OrderNumber): boolean {
    if (!other) return false;
    return this.value === other.toValue();
  }
}
