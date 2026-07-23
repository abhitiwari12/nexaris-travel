import { Body, Controller, Get, Headers, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { ForgotPasswordDto, LoginDto, RefreshDto, RegisterDto, ResetPasswordDto, VerifyEmailDto } from './auth.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() dto: RegisterDto, @Headers('user-agent') userAgent?: string, @Req() request?: Request) { return this.auth.register(dto, userAgent, request?.ip); }
  @Post('login') @HttpCode(200) login(@Body() dto: LoginDto, @Headers('user-agent') userAgent?: string, @Req() request?: Request) { return this.auth.login(dto, userAgent, request?.ip); }
  @Post('refresh') @HttpCode(200) refresh(@Body() dto: RefreshDto, @Headers('user-agent') userAgent?: string, @Req() request?: Request) { return this.auth.refresh(dto.refreshToken, userAgent, request?.ip); }
  @Post('forgot-password') @HttpCode(202) forgot(@Body() dto: ForgotPasswordDto) { return this.auth.forgotPassword(dto); }
  @Post('reset-password') @HttpCode(200) reset(@Body() dto: ResetPasswordDto) { return this.auth.resetPassword(dto); }
  @Post('verify-email') @HttpCode(200) verify(@Body() dto: VerifyEmailDto) { return this.auth.verifyEmail(dto); }
  @Post('logout') @HttpCode(200) @ApiBearerAuth() @UseGuards(JwtAuthGuard) logout(@CurrentUser() user: AuthenticatedUser) { return this.auth.logout(user.id, user.sessionId); }
  @Get('me') @ApiBearerAuth() @UseGuards(JwtAuthGuard) me(@CurrentUser() user: AuthenticatedUser) { return user; }
}
