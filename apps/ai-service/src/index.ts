import OpenAI from 'openai';
import { aiPromptSchema } from '@nexaris/shared';

export type TravelPlan = { summary: string; days: Array<{ day: number; focus: string; estimatedCost: number }>; cautions: string[] };
export class NexarisAiPlanner {
  private readonly client: OpenAI;
  constructor(apiKey = process.env.OPENAI_API_KEY) { this.client = new OpenAI({ apiKey }); }
  async plan(input: unknown): Promise<TravelPlan> {
    const prompt = aiPromptSchema.parse(input);
    const response = await this.client.responses.create({ model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini', input: [{ role: 'system', content: 'Return concise, safe, budget-aware travel planning guidance.' }, { role: 'user', content: prompt.message }] });
    return { summary: response.output_text, days: [{ day: 1, focus: 'Arrival, recovery, and neighborhood orientation', estimatedCost: prompt.travelerContext.budget ? Math.round(prompt.travelerContext.budget * 0.18) : 250 }], cautions: ['Confirm visa, passport validity, and airline fare rules before purchase.'] };
  }
}
