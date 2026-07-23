import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { EmailModule } from '../email/email.module.js';
@Module({ imports: [EmailModule, JwtModule.register({})], controllers: [AuthController], providers: [AuthService], exports: [AuthService, JwtModule] })
export class AuthModule {}
