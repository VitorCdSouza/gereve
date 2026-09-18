import { EventStatus, User, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prismaClient } from '../src/lib/prisma';

const PASSWORD_SALT_ROUNDS = 10;
const SEED_PASSWORD = 'senha-forte-123';

type SeedUser = {
    name: string;
    email: string;
    role: UserRole;
};

type SeedEvent = {
    id: string;
    title: string;
    description: string;
    location: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
    status: EventStatus;
    organizerEmail: string;
};

const seedUsers: SeedUser[] = [
    {
        name: 'Administradora Gereve',
        email: 'admin@gereve.dev',
        role: UserRole.ADMIN,
    },
    {
        name: 'Organizador de Teste',
        email: 'organizador@gereve.dev',
        role: UserRole.ORGANIZER,
    },
    {
        name: 'Segunda Organizadora',
        email: 'organizadora@gereve.dev',
        role: UserRole.ORGANIZER,
    },
    {
        name: 'Cliente de Teste',
        email: 'cliente@gereve.dev',
        role: UserRole.CUSTOMER,
    },
];

const seedEvents: SeedEvent[] = [
    {
        id: '11111111-1111-4111-8111-111111111111',
        title: 'Palestra de Node.js',
        description: 'Introdução prática a APIs com Express e Prisma',
        location: 'Laboratório de Informática 4, Bloco C',
        startsAt: '2026-10-01T18:00:00-03:00',
        endsAt: '2026-10-01T21:00:00-03:00',
        capacity: 30,
        status: EventStatus.PUBLISHED,
        organizerEmail: 'organizador@gereve.dev',
    },
    {
        id: '22222222-2222-4222-8222-222222222222',
        title: 'Workshop de PostgreSQL',
        description: 'Modelagem relacional, índices e planos de execução',
        location: 'Laboratório de Informática 2, Bloco C',
        startsAt: '2026-10-15T19:00:00-03:00',
        endsAt: '2026-10-15T22:00:00-03:00',
        capacity: 2,
        status: EventStatus.PUBLISHED,
        organizerEmail: 'organizador@gereve.dev',
    },
    {
        id: '33333333-3333-4333-8333-333333333333',
        title: 'Maratona de Programação',
        description: 'Competição interna com problemas de algoritmos e estruturas de dados',
        location: 'Auditório do Bloco A',
        startsAt: '2026-11-07T09:00:00-03:00',
        endsAt: '2026-11-07T17:00:00-03:00',
        capacity: 100,
        status: EventStatus.DRAFT,
        organizerEmail: 'organizadora@gereve.dev',
    },
    {
        id: '44444444-4444-4444-8444-444444444444',
        title: 'Semana de Tecnologia',
        description: 'Ciclo de palestras adiado para o semestre seguinte',
        location: 'Auditório do Bloco A',
        startsAt: '2026-11-20T09:00:00-03:00',
        endsAt: '2026-11-22T18:00:00-03:00',
        capacity: 200,
        status: EventStatus.CANCELLED,
        organizerEmail: 'organizadora@gereve.dev',
    },
];

async function upsertUsers(passwordHash: string): Promise<User[]> {
    const createdUsers: User[] = [];

    for (const seedUser of seedUsers) {
        const createdUser = await prismaClient.user.upsert({
            where: { email: seedUser.email },
            update: {
                name: seedUser.name,
                role: seedUser.role,
                passwordHash,
            },
            create: {
                name: seedUser.name,
                email: seedUser.email,
                role: seedUser.role,
                passwordHash,
            },
        });

        createdUsers.push(createdUser);
    }

    return createdUsers;
}

function findOrganizerId(users: User[], organizerEmail: string): string {
    const organizer = users.find((user) => user.email === organizerEmail);

    if (organizer === undefined) {
        throw new Error(`Organizador não encontrado no seed: ${organizerEmail}`);
    }

    return organizer.id;
}

async function upsertEvents(users: User[]): Promise<number> {
    for (const seedEvent of seedEvents) {
        const organizerId = findOrganizerId(users, seedEvent.organizerEmail);

        const eventData = {
            title: seedEvent.title,
            description: seedEvent.description,
            location: seedEvent.location,
            startsAt: new Date(seedEvent.startsAt),
            endsAt: new Date(seedEvent.endsAt),
            capacity: seedEvent.capacity,
            status: seedEvent.status,
            organizerId,
        };

        await prismaClient.event.upsert({
            where: { id: seedEvent.id },
            update: eventData,
            create: { id: seedEvent.id, ...eventData },
        });
    }

    return seedEvents.length;
}

async function seed(): Promise<void> {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, PASSWORD_SALT_ROUNDS);

    const createdUsers = await upsertUsers(passwordHash);
    const createdEventsCount = await upsertEvents(createdUsers);

    console.log(`seed concluído: ${createdUsers.length} usuários e ${createdEventsCount} eventos`);
    console.log(`senha de todos os usuários do seed: ${SEED_PASSWORD}`);
}

seed()
    .catch((error: unknown) => {
        console.error('falha ao executar o seed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prismaClient.$disconnect();
    });
