import { MongoProductRepository } from './repositories/mongo-product.repository';
import { ProductFactory } from '../../domain/factories/product.factory';
import { SEED_PRODUCTS } from './catalog-seed-data';

export class CatalogSeeder {
  public static async seedCatalog(): Promise<void> {
    const productRepo = new MongoProductRepository();
    const existing = await productRepo.findMany({ limit: 1 });

    if (existing.total === 0) {
      console.log('📦 Sembrando catálogo inicial de productos de Librería Rubén Darío...');
      for (const dto of SEED_PRODUCTS) {
        const product = ProductFactory.create(dto);
        await productRepo.save(product);
      }
      console.log(`✅ ${SEED_PRODUCTS.length} productos sembrados exitosamente.`);
    }
  }
}
