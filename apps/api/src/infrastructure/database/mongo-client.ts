import { MongoClient as NativeMongoClient, Db, Collection } from 'mongodb';
import { EnvConfig } from '../config/env.config';

export class MongoClient {
  private static instance: MongoClient;
  private client: NativeMongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  public static getInstance(): MongoClient {
    if (!MongoClient.instance) {
      MongoClient.instance = new MongoClient();
    }
    return MongoClient.instance;
  }

  public async connect(): Promise<Db> {
    if (this.db) return this.db;

    this.client = new NativeMongoClient(EnvConfig.MONGODB_URI);
    await this.client.connect();
    this.db = this.client.db(EnvConfig.MONGODB_DB_NAME);
    await this.setupIndexes();
    return this.db;
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('Base de datos no inicializada. Llame a connect() primero.');
    }
    return this.db;
  }

  public getCollection(name: string): Collection<any> {
    return this.getDb().collection(name);
  }

  private async setupIndexes(): Promise<void> {
    if (!this.db) return;
    await this.db.collection('staff_users').createIndex({ email: 1 }, { unique: true });
    await this.db.collection('customer_users').createIndex({ email: 1 }, { unique: true });
    await this.db.collection('customer_users').createIndex({ cuitCuil: 1 }, { unique: true });
    await this.db.collection('products').createIndex({ barcode: 1 });
    await this.db.collection('products').createIndex({ name: 'text', description: 'text', tags: 'text' });
    await this.db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await this.db.collection('orders').createIndex({ customerId: 1, createdAt: -1 });
    await this.db.collection('audit_logs').createIndex({ timestamp: -1 });
    await this.db.collection('audit_logs').createIndex({ tags: 1 });
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}
