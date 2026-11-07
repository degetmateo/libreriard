import { App } from './app';
import { MongoClient } from './infrastructure/database/mongo-client';
import { DatabaseSeeder } from './infrastructure/database/database-seeder';
import { EnvConfig } from './infrastructure/config/env.config';

async function bootstrap() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await MongoClient.getInstance().connect();
    console.log('✅ Conexión a MongoDB establecida exitosamente.');

    await DatabaseSeeder.seedInitialAdmin();

    const application = new App();
    application.app.listen(EnvConfig.PORT, () => {
      console.log(`🚀 Servidor API de Librería Rubén Darío ejecutándose en: http://localhost:${EnvConfig.PORT}`);
      console.log(`📡 URL API Base: http://localhost:${EnvConfig.PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();
