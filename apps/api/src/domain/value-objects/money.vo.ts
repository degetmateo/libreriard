export class Money {
  private readonly amount: number;

  constructor(amount: number) {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      throw new Error(`Monto inválido para valor monetario: ${amount}`);
    }
    this.amount = Math.round(amount * 100) / 100;
  }

  public static from(amount: number): Money {
    return new Money(amount);
  }

  public static zero(): Money {
    return new Money(0);
  }

  public getAmount(): number {
    return this.amount;
  }

  public add(other: Money): Money {
    return new Money(this.amount + other.getAmount());
  }

  public multiply(factor: number): Money {
    return new Money(this.amount * factor);
  }

  public equals(other: Money): boolean {
    if (!other) return false;
    return this.amount === other.getAmount();
  }
}

