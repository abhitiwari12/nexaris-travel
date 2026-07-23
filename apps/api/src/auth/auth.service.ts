import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto, VerifyEmailDto } from './auth.dto.js';

type TokenPair = { accessToken: string; refreshToken: string; sessionId: string };
type RefreshPayload = { sub: string; sessionId: string; type: 'refresh' };

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly email: EmailService) {}

  async register(dto: RegisterDto, userAgent?: string, ipAddress?: string): Promise<TokenPair> {
    const email = dto.email.toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) throw new ConflictException('Email is already registered');
    const travelerRole = await this.prisma.role.upsert({ where: { name: 'TRAVELER' }, update: {}, create: { name: 'TRAVELER', description: 'Traveler customer role' } });
    const user = await this.prisma.user.create({ data: { email, passwordHash: await bcrypt.hash(dto.password, 12), firstName: dto.firstName, lastName: dto.lastName, roles: { create: { roleId: travelerRole.id } }, notificationSettings: { create: {} } } });
    const verificationToken = await this.createEmailVerificationToken(user.id);
    await this.email.sendVerificationEmail(user.email, verificationToken);
    await this.email.sendWelcomeEmail(user.email);
    return this.issueTokens(user.id, user.email, userAgent, ipAddress);
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user?.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user.id, user.email, userAgent, ipAddress);
  }

  async refresh(refreshToken: string, userAgent?: string, ipAddress?: string): Promise<TokenPair> {
    const payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, { secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'development-refresh-secret-change-me' });
    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid refresh token');
    const records = await this.prisma.refreshToken.findMany({ where: { userId: payload.sub, sessionId: payload.sessionId, revokedAt: null, expiresAt: { gt: new Date() } }, include: { user: true } });
    const record = records.find((candidate) => bcrypt.compareSync(refreshToken, candidate.tokenHash));
    if (!record) throw new UnauthorizedException('Refresh token was rotated or revoked');
    await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    return this.issueTokens(record.userId, record.user.email, userAgent, ipAddress, payload.sessionId, record.id);
  }

  async logout(userId: string, sessionId: string): Promise<{ revoked: true }> {
    await this.prisma.session.updateMany({ where: { id: sessionId, userId }, data: { revokedAt: new Date() } });
    await this.prisma.refreshToken.updateMany({ where: { sessionId, userId, revokedAt: null }, data: { revokedAt: new Date() } });
    return { revoked: true };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ accepted: true }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (user) await this.email.sendPasswordResetEmail(user.email, await this.createPasswordResetToken(user.id));
    return { accepted: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ reset: true }> {
    const records = await this.prisma.passwordResetToken.findMany({ where: { consumedAt: null, expiresAt: { gt: new Date() } } });
    const record = records.find((candidate) => bcrypt.compareSync(dto.token, candidate.tokenHash));
    if (!record) throw new UnauthorizedException('Invalid or expired reset token');
    await this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(dto.password, 12) } });
    await this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    await this.prisma.refreshToken.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } });
    return { reset: true };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ verified: true }> {
    const records = await this.prisma.emailVerificationToken.findMany({ where: { consumedAt: null, expiresAt: { gt: new Date() } } });
    const record = records.find((candidate) => bcrypt.compareSync(dto.token, candidate.tokenHash));
    if (!record) throw new UnauthorizedException('Invalid or expired verification token');
    await this.prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } });
    await this.prisma.emailVerificationToken.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    return { verified: true };
  }

  private async issueTokens(userId: string, email: string, userAgent?: string, ipAddress?: string, existingSessionId?: string, replacedTokenId?: string): Promise<TokenPair> {
    const session = existingSessionId ? await this.prisma.session.update({ where: { id: existingSessionId }, data: { userAgent, ipAddress } }) : await this.prisma.session.create({ data: { userId, userAgent, ipAddress, expiresAt: new Date(Date.now() + 30 * 86400000) } });
    const accessToken = await this.jwt.signAsync({ sub: userId, email, sessionId: session.id }, { secret: process.env.JWT_SECRET ?? 'development-secret-change-me-development', expiresIn: '15m' });
    const refreshToken = await this.jwt.signAsync({ sub: userId, sessionId: session.id, type: 'refresh' }, { secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'development-refresh-secret-change-me', expiresIn: '30d' });
    const tokenRecord = await this.prisma.refreshToken.create({ data: { userId, sessionId: session.id, tokenHash: await bcrypt.hash(refreshToken, 12), replacedByTokenId: replacedTokenId, expiresAt: new Date(Date.now() + 30 * 86400000) } });
    await this.prisma.session.update({ where: { id: session.id }, data: { refreshTokenHash: tokenRecord.tokenHash } });
    return { accessToken, refreshToken, sessionId: session.id };
  }

  private async createEmailVerificationToken(userId: string): Promise<string> { const token = randomBytes(32).toString('hex'); await this.prisma.emailVerificationToken.create({ data: { userId, tokenHash: await bcrypt.hash(token, 12), expiresAt: new Date(Date.now() + 24 * 3600000) } }); return token; }
  private async createPasswordResetToken(userId: string): Promise<string> { const token = randomBytes(32).toString('hex'); await this.prisma.passwordResetToken.create({ data: { userId, tokenHash: await bcrypt.hash(token, 12), expiresAt: new Date(Date.now() + 3600000) } }); return token; }
}
