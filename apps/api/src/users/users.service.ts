import { Injectable, NotFoundException } from '@nestjs/common';
import { CabinClass } from '@nexaris/database';
import { PrismaService } from '../prisma/prisma.service.js';
import { AddPaymentMethodDto, UpdateNotificationSettingsDto, UpdateProfileDto, UpdateTravelPreferencesDto } from './users.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { roles: { include: { role: true } }, preferences: true, notificationSettings: true, paymentMethods: true } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
  updateProfile(userId: string, dto: UpdateProfileDto) { return this.prisma.user.update({ where: { id: userId }, data: dto, select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true, updatedAt: true } }); }
  updateAvatar(userId: string, avatarUrl: string) { return this.updateProfile(userId, { avatarUrl }); }
  upsertPreferences(userId: string, dto: UpdateTravelPreferencesDto) { const cabin = this.toCabin(dto.cabin); return this.prisma.travelPreference.upsert({ where: { userId }, create: { userId, interests: dto.interests ?? [], dietaryNeeds: dto.dietaryNeeds ?? [], accessibilityNeeds: dto.accessibilityNeeds ?? [], homeAirport: dto.homeAirport, budgetMin: dto.budgetMin, budgetMax: dto.budgetMax, cabin }, update: { ...dto, cabin } }); }
  private toCabin(value?: string): CabinClass { return value === CabinClass.BUSINESS || value === CabinClass.FIRST || value === CabinClass.PREMIUM_ECONOMY ? value : CabinClass.ECONOMY; }
  upsertNotificationSettings(userId: string, dto: UpdateNotificationSettingsDto) { return this.prisma.notificationSetting.upsert({ where: { userId }, create: { userId, ...dto }, update: dto }); }
  async addPaymentMethod(userId: string, dto: AddPaymentMethodDto) { if (dto.isDefault) await this.prisma.savedPaymentMethod.updateMany({ where: { userId }, data: { isDefault: false } }); return this.prisma.savedPaymentMethod.create({ data: { userId, ...dto } }); }
}
