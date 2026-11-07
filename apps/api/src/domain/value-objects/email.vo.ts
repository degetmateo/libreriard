export class Email {
  private readonly value: string;
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(value: string) {
    if (!value || !Email.EMAIL_REGEX.test(value.trim())) {
      throw new Error(`Dirección de correo electrónico inválida: ${value}`);
    }
    this.value = value.trim().toLowerCase();
  }

  public static create(value: string): Email {
    return new Email(value);
  }

  public static isValid(value: string): boolean {
    return typeof value === 'string' && Email.EMAIL_REGEX.test(value.trim());
  }

  public toString(): string {
    return this.value;
  }

  public toValue(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    if (!other) return false;
    return this.value === other.toValue();
  }
}

