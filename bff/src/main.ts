import { ExceptionsFilter } from '@bff/filters';
import { ResponseInterceptor } from '@bff/response-parsers';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggingInterceptor, LoggingService } from '@node-capabilities/logging';
import cookieParser from 'cookie-parser';
import * as dotEnv from 'dotenv';
import helmet from 'helmet';
import https from 'https';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';

dotEnv.config();

async function bootstrap() {
  https.globalAgent.options.rejectUnauthorized = false;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    /*   httpsOptions: {
      // key: fs.readFileSync('privkey.pem', 'ascii'),
      // cert: fs.readFileSync('fullchain.pem', 'ascii'), // a PEM containing the SERVER and ALL INTERMEDIATES
    }, */
  });

  const logger = app.get(LoggingService);

  app.useLogger(process.env.LOGGER_ENABLED === 'false' ? false : logger); // env.LOGGER no sirve
  app.useGlobalInterceptors(new LoggingInterceptor(logger));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ExceptionsFilter());

  app.enableCors({ origin: process.env.CORS_ORIGIN || true });
  app.use(cookieParser()); // attaches cookies to request object
  app.use(helmet()); // applies security hardening settings. using defaults: https://www.npmjs.com/package/helmet

  setupSwagger(app);

  const port = process.env.PORT ?? 4000;

  await app.listen(port, () => logger.log('Application is running at port: ' + port));
}

bootstrap();
