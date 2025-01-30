import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'security.roundsOfHashing') {
                return '10';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
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
        },
        {
          id: 2,
          name: 'Jane Doe',
          email: 'test2@example.com',
          password: 'password2',
          createdAt: new Date(),
          updatedAt: new Date(),
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
        },
        {
          id: 2,
          name: 'Jane Doe',
          email: 'test2@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
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
      };

      jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUser);

      const result = await service.remove(1);

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });
  });
});
