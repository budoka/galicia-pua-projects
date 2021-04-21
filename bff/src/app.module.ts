import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { GaliciaHttpModule } from '@node-capabilities/http';
import { LoggingModule } from '@node-capabilities/logging';
import { TracingInterceptor, TracingModule } from '@node-capabilities/tracing';
import { ApiController } from './api/api.controller';
import { ApiModule } from './api/api.module';
import { ApiService } from './api/api.service';
import { AppHealthIndicator } from './health/health';
import { HealthController } from './health/health.controller';
import { PermissionsModule } from './permissions/permissions.module';

const tracer = TracingModule.forRoot({
  serviceName: process.env.JAEGER_SERVICE_NAME,
  sampler: {
    type: process.env.JAEGER_SAMPLER_TYPE ?? 'udp4',
    param: 1,
  },
  reporter: {
    logSpans: process.env.JAEGER_LOG_SPANS === 'true',
  },
});

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TracingInterceptor,
    },
    ApiService,
    AppHealthIndicator,
  ],
  controllers: [ApiController, HealthController],
  imports: [
    LoggingModule.forRoot({
      isDev: process.env.NODE_ENV === 'development',
      level: 'info',
    }),
    tracer,
    GaliciaHttpModule.withTracing(),
    PermissionsModule,
    ApiModule,
    TerminusModule,
  ],
})
export class AppModule {}
