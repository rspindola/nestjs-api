import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  AppAbility,
  CaslAbilityFactory,
  Subjects,
} from '../casl/casl-ability.factory';
import { Ability, AbilityBuilder } from '@casl/ability';
import { Action } from '../casl/enum';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let configService: ConfigService;
  let caslAbilityFactory: CaslAbilityFactory;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'security.roundsOfHashing') {
          return '10';
        }
        return null;
      }),
    };

    const mockCaslAbilityFactory = {
      createForUser: jest.fn((user) => {
        const { can, build } = new AbilityBuilder<AppAbility>(Ability as any);

        if (user.role.name === 'admin') {
          can(Action.Update, 'Role'); // Admin pode atualizar papéis
        }

        return build() as AppAbility; // Retorna um objeto compatível com AppAbility
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CaslAbilityFactory,
          useValue: mockCaslAbilityFactory,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    caslAbilityFactory = module.get<CaslAbilityFactory>(CaslAbilityFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash the password and create a user', async () => {
      const createUserDto = {
        name: 'test user',
        email: 'test@example.com',
        password: 'password123',
      };
      const hashedPassword = 'hashedPassword';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        id: 1,
        name: 'test user',
        email: 'test@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: null,
      });

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'test user',
          email: 'test@example.com',
          password: hashedPassword,
        },
      });
      expect(result).toEqual({
        id: 1,
        name: 'test user',
        email: 'test@example.com',
        password: hashedPassword,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        roleId: null,
      });
    });

    it('should throw a ConflictException if email is already in use', async () => {
      const createUserDto = {
        name: 'test user',
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock válido do erro PrismaClientKnownRequestError
      const mockError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields',
        { code: 'P2002' } as any, // Passa o código corretamente no segundo argumento
      );

      jest.spyOn(prisma.user, 'create').mockRejectedValue(mockError);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should rethrow a generic error if it is not a known Prisma error', async () => {
      const createUserDto = {
        name: 'test user',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockGenericError = new Error('Something went wrong');

      jest.spyOn(prisma.user, 'create').mockRejectedValue(mockGenericError);

      await expect(service.create(createUserDto)).rejects.toThrow(
        mockGenericError,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = {
        id: 1,
        name: 'test user',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: null,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'notfound@example.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'John Doe',
          email: 'test1@example.com',
          password: 'password1',
          createdAt: new Date(),
          updatedAt: new Date(),
          roleId: null,
        },
        {
          id: 2,
          name: 'Jane Doe',
          email: 'test2@example.com',
          password: 'password2',
          createdAt: new Date(),
          updatedAt: new Date(),
          roleId: null,
        },
      ];

      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 1,
          name: 'John Doe',
          email: 'test1@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          roleId: null,
        },
        {
          id: 2,
          name: 'Jane Doe',
          email: 'test2@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          roleId: null,
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: null,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user without hashing the password if not provided', async () => {
      const updateUserDto = { email: 'updated@example.com' };
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'updated@example.com',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: null,
      };

      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser);

      const result = await service.update(1, updateUserDto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateUserDto,
      });
      expect(result).toEqual(mockUser);
    });

    it('should hash the password and update the user if password is provided', async () => {
      const updateUserDto = { password: 'newpassword123' };
      const hashedPassword = 'hashedPassword';
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'updated@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: null,
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser);

      const result = await service.update(1, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: hashedPassword },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: null,
      };

      jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUser);

      const result = await service.remove(1);

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });
  });

  describe('assignRole', () => {
    it('should assign a role if user has permission', async () => {
      const mockCurrentUser = {
        id: 1,
        role: {
          name: 'admin',
          permissions: [{ name: 'update@Role' }],
        },
      };

      const mockRole = { id: 1, name: 'editor' };
      const mockUpdatedUser = {
        id: 2,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: mockRole.id,
      };

      jest.spyOn(prisma.role, 'findUnique').mockResolvedValue(mockRole);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUpdatedUser);

      await expect(
        service.assignRole(2, 'editor', mockCurrentUser),
      ).resolves.not.toThrow();

      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'editor' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { roleId: mockRole.id },
      });
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      const mockCurrentUser = {
        id: 1,
        role: {
          name: 'user',
          permissions: [{ name: 'read@User' }],
        },
      };

      // Ajusta o mock para retornar uma habilidade sem permissões
      jest
        .spyOn(caslAbilityFactory, 'createForUser')
        .mockReturnValue(new Ability<[Action, Subjects]>([]));

      await expect(
        service.assignRole(2, 'editor', mockCurrentUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});