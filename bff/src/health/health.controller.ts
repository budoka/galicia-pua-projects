import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { AppHealthIndicator } from './health';

@Controller(process.env.HEALTH_URL || 'health')
export class HealthController {
  constructor(private service: HealthCheckService, private appHealth: AppHealthIndicator) {}

  @Get()
  @HealthCheck()
  check() {
    return this.service.check([() => this.appHealth.isHealthy('app health')]);
  }
}
