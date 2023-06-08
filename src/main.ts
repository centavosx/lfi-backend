import { AppModule } from './app.module';
import { NestFactory, Reflector } from '@nestjs/core';
import { INestApplication } from '@nestjs/common/interfaces';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';

function configureSwagger(app: INestApplication): void {
  const options = new DocumentBuilder().addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/document', app, document);
}

async function bootstrap() {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';

  const app = await NestFactory.create(AppModule);
  const moduleRef = app.select(AppModule);
  const reflector = moduleRef.get(Reflector);
  const rolesGuard = new RolesGuard(reflector);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors();
  app.useGlobalGuards(rolesGuard);
  app.useGlobalPipes(new ValidationPipe());
  if (isDevelopment) configureSwagger(app);
  await app.init();
  await app.listen(process.env.PORT || 3002);
}
bootstrap();
