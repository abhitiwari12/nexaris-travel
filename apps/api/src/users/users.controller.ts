import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { AddPaymentMethodDto, UpdateNotificationSettingsDto, UpdateProfileDto, UpdateTravelPreferencesDto } from './users.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get('me') me(@CurrentUser() user: AuthenticatedUser) { return this.users.me(user.id); }
  @Patch('me') update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) { return this.users.updateProfile(user.id, dto); }
  @Patch('me/avatar') avatar(@CurrentUser() user: AuthenticatedUser, @Body('avatarUrl') avatarUrl: string) { return this.users.updateAvatar(user.id, avatarUrl); }
  @Patch('me/preferences') preferences(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateTravelPreferencesDto) { return this.users.upsertPreferences(user.id, dto); }
  @Patch('me/notifications') notifications(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateNotificationSettingsDto) { return this.users.upsertNotificationSettings(user.id, dto); }
  @Post('me/payment-methods') paymentMethod(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddPaymentMethodDto) { return this.users.addPaymentMethod(user.id, dto); }
}
