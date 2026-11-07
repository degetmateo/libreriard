import { UUIDv7 } from '../value-objects/uuid-v7.vo';

export interface PriceHistoryProps {
  id?: UUIDv7;
  productId: UUIDv7;
  productName: string;
  priceType: 'RETAIL' | 'WHOLESALE';
  oldPrice: number | null;
  newPrice: number | null;
  diffAmount: number;
  diffPercentage: number;
  changedBy?: {
    id: string;
    name: string;
    email: string;
  };
  source: string;
  createdAt?: Date;
}

export class PriceHistory {
  private readonly _id: UUIDv7;
  private readonly _productId: UUIDv7;
  private readonly _productName: string;
  private readonly _priceType: 'RETAIL' | 'WHOLESALE';
  private readonly _oldPrice: number | null;
  private readonly _newPrice: number | null;
  private readonly _diffAmount: number;
  private readonly _diffPercentage: number;
  private readonly _changedBy?: {
    id: string;
    name: string;
    email: string;
  };
  private readonly _source: string;
  private readonly _createdAt: Date;

  constructor(props: PriceHistoryProps) {
    this._id = props.id || UUIDv7.generate();
    this._productId = props.productId;
    this._productName = props.productName;
    this._priceType = props.priceType;
    this._oldPrice = props.oldPrice;
    this._newPrice = props.newPrice;
    this._diffAmount = props.diffAmount;
    this._diffPercentage = props.diffPercentage;
    this._changedBy = props.changedBy;
    this._source = props.source;
    this._createdAt = props.createdAt || new Date();
  }

  public get id(): UUIDv7 { return this._id; }
  public get productId(): UUIDv7 { return this._productId; }
  public get productName(): string { return this._productName; }
  public get priceType(): 'RETAIL' | 'WHOLESALE' { return this._priceType; }
  public get oldPrice(): number | null { return this._oldPrice; }
  public get newPrice(): number | null { return this._newPrice; }
  public get diffAmount(): number { return this._diffAmount; }
  public get diffPercentage(): number { return this._diffPercentage; }
  public get changedBy(): { id: string; name: string; email: string } | undefined { return this._changedBy; }
  public get source(): string { return this._source; }
  public get createdAt(): Date { return this._createdAt; }
}

