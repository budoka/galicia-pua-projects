import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export interface SwaggerOptions {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}

export const setupSwagger = (app: NestExpressApplication, config?: SwaggerOptions) => {
  const swagger: SwaggerOptions = {
    enabled: process.env.SWAGGER_SHOW === 'true' ? true : false,
    title: `Swagger - ${require('../package.json').name}`,
    description: `${require('../package.json').description}`,
    version: process.env.SWAGGER_VERSION ?? '3.0.3',
    path: process.env.SWAGGER_PATH ?? '/swagger',
    ...config,
  };

  if (swagger.enabled) {
    const { title, description, version, path } = swagger;

    const options = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version)
      .build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup(path, app, document);
  }
};
