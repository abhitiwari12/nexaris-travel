import bcrypt from 'bcryptjs';
import { PrismaClient, RoleName } from '@prisma/client';

const prisma = new PrismaClient();
const permissions = [
  ['read', 'users'], ['update', 'users'], ['read', 'bookings'], ['manage', 'bookings'], ['read', 'payments'], ['manage', 'payments'], ['read', 'admin'], ['manage', 'admin'], ['read', 'flights'], ['manage', 'flights']
] as const;

async function main(): Promise<void> {
  const permissionRecords = await Promise.all(permissions.map(([action, subject]) => prisma.permission.upsert({ where: { action_subject: { action, subject } }, update: {}, create: { action, subject } })));
  const traveler = await prisma.role.upsert({ where: { name: RoleName.TRAVELER }, update: {}, create: { name: RoleName.TRAVELER, description: 'Customer traveler' } });
  await prisma.role.upsert({ where: { name: RoleName.AGENT }, update: { permissions: { set: permissionRecords.filter((permission) => ['read', 'update'].includes(permission.action)).map((permission) => ({ id: permission.id })) } }, create: { name: RoleName.AGENT, description: 'Travel support agent', permissions: { connect: permissionRecords.filter((permission) => ['read', 'update'].includes(permission.action)).map((permission) => ({ id: permission.id })) } } });
  const adminRole = await prisma.role.upsert({ where: { name: RoleName.ADMIN }, update: { permissions: { set: permissionRecords.map((permission) => ({ id: permission.id })) } }, create: { name: RoleName.ADMIN, description: 'Platform administrator', permissions: { connect: permissionRecords.map((permission) => ({ id: permission.id })) } } });
  await prisma.role.upsert({ where: { name: RoleName.SUPER_ADMIN }, update: { permissions: { set: permissionRecords.map((permission) => ({ id: permission.id })) } }, create: { name: RoleName.SUPER_ADMIN, description: 'Full system administrator', permissions: { connect: permissionRecords.map((permission) => ({ id: permission.id })) } } });

  await Promise.all([
    prisma.airport.upsert({ where: { iataCode: 'JFK' }, update: {}, create: { iataCode: 'JFK', icaoCode: 'KJFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', timezone: 'America/New_York', latitude: 40.6413, longitude: -73.7781, popularity: 100 } }),
    prisma.airport.upsert({ where: { iataCode: 'LHR' }, update: {}, create: { iataCode: 'LHR', icaoCode: 'EGLL', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', timezone: 'Europe/London', latitude: 51.47, longitude: -0.4543, popularity: 98 } }),
    prisma.airport.upsert({ where: { iataCode: 'SFO' }, update: {}, create: { iataCode: 'SFO', icaoCode: 'KSFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles', latitude: 37.6152, longitude: -122.39, popularity: 92 } }),
    prisma.airport.upsert({ where: { iataCode: 'HND' }, update: {}, create: { iataCode: 'HND', icaoCode: 'RJTT', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', latitude: 35.5494, longitude: 139.7798, popularity: 96 } }),
    prisma.airport.upsert({ where: { iataCode: 'DXB' }, update: {}, create: { iataCode: 'DXB', icaoCode: 'OMDB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', latitude: 25.2532, longitude: 55.3657, popularity: 97 } }),
    prisma.airport.upsert({ where: { iataCode: 'CDG' }, update: {}, create: { iataCode: 'CDG', icaoCode: 'LFPG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', timezone: 'Europe/Paris', latitude: 49.0097, longitude: 2.5479, popularity: 95 } })
  ]);
  await Promise.all([
    prisma.airline.upsert({ where: { iataCode: 'AA' }, update: {}, create: { iataCode: 'AA', icaoCode: 'AAL', name: 'American Airlines', alliance: 'oneworld', country: 'United States', rating: 4.1 } }),
    prisma.airline.upsert({ where: { iataCode: 'BA' }, update: {}, create: { iataCode: 'BA', icaoCode: 'BAW', name: 'British Airways', alliance: 'oneworld', country: 'United Kingdom', rating: 4.0 } }),
    prisma.airline.upsert({ where: { iataCode: 'AF' }, update: {}, create: { iataCode: 'AF', icaoCode: 'AFR', name: 'Air France', alliance: 'SkyTeam', country: 'France', rating: 4.2 } }),
    prisma.airline.upsert({ where: { iataCode: 'EK' }, update: {}, create: { iataCode: 'EK', icaoCode: 'UAE', name: 'Emirates', alliance: null, country: 'United Arab Emirates', rating: 4.6 } }),
    prisma.airline.upsert({ where: { iataCode: 'NH' }, update: {}, create: { iataCode: 'NH', icaoCode: 'ANA', name: 'All Nippon Airways', alliance: 'Star Alliance', country: 'Japan', rating: 4.7 } })
  ]);
  const admin = await prisma.user.upsert({ where: { email: process.env.SEED_ADMIN_EMAIL ?? 'admin@nexaris.ai' }, update: {}, create: { email: process.env.SEED_ADMIN_EMAIL ?? 'admin@nexaris.ai', passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe!ChangeMe!2026', 12), firstName: 'Nexaris', lastName: 'Admin', emailVerifiedAt: new Date(), roles: { create: [{ roleId: adminRole.id }, { roleId: traveler.id }] }, notificationSettings: { create: { email: true, push: true } } } });
  console.info(`Seeded roles, permissions, and admin ${admin.email}`);
}

main().finally(async () => prisma.$disconnect());
