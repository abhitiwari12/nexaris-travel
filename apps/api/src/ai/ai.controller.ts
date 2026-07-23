import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiChatDto } from './ai.dto.js';
import { AiService } from './ai.service.js';
@ApiTags('ai')
@Controller({ path: 'ai', version: '1' })
export class AiController { constructor(private readonly ai: AiService) {} @Post('chat') chat(@Body() dto: AiChatDto) { return this.ai.chat(dto); } }
