import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../decorators/current-user.decorator.js';

type JwtPayload = { sub: string; email: string; sessionId: string };
type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Missing bearer token');
    const payload = await this.jwt.verifyAsync<JwtPayload>(token, { secret: process.env.JWT_SECRET ?? 'development-secret-change-me-development' });
    const session = await this.prisma.session.findFirst({ where: { id: payload.sessionId, userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } }, include: { user: { include: { roles: { include: { role: { include: { permissions: true } } } } } } } });
    if (!session) throw new UnauthorizedException('Session expired or revoked');
    const roles = session.user.roles.map((userRole) => userRole.role.name);
    const permissions = session.user.roles.flatMap((userRole) => userRole.role.permissions.map((permission) => `${permission.action}:${permission.subject}`));
    request.user = { id: session.user.id, email: session.user.email, roles, permissions, sessionId: session.id };
    return true;
  }
  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
