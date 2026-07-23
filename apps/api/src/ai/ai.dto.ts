import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
export class AiChatDto { @IsString() @MinLength(1) @MaxLength(4000) message!: string; @IsOptional() @IsUUID() conversationId?: string; }
