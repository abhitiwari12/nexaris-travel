import { Injectable } from '@nestjs/common';
import { AiChatDto } from './ai.dto.js';
@Injectable()
export class AiService { async chat(dto: AiChatDto) { const suggestions = ['Compare flexible-date fares', 'Add a rest day after long-haul arrival', 'Protect the booking with refundable hotel rates']; return { conversationId: dto.conversationId ?? crypto.randomUUID(), answer: `Nexaris AI recommends starting with flight timing, budget guardrails, and traveler preferences for: ${dto.message}`, suggestions, structured: { intent: 'TRAVEL_PLANNING', nextAction: 'SEARCH_FLIGHTS' } }; } }
