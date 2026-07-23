import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  @Get()
  check(): { status: 'ok'; service: string; timestamp: string } { return { status: 'ok', service: 'nexaris-api', timestamp: new Date().toISOString() }; }
}
