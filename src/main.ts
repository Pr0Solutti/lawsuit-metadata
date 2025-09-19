import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as nodeCrypto from 'crypto';
if (!(global as any).crypto) {
  (global as any).crypto = {
    randomUUID: nodeCrypto.randomUUID,
  };
}
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
