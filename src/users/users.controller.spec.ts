import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { Reflector } from '@nestjs/core';
import { PoliciesGuard } from '../casl/policies.guard';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const mockPoliciesGuard = {
      canActivate: jest.fn(() => true), // Sempre permite acesso
    };

    const mockCaslAbilityFactory = {
      createForUser: jest.fn(), // Mocka o método createForUser
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            assignRole: jest.fn(),
          },
        },
        Reflector,
        {
          provide: PoliciesGuard, // Mocka explicitamente o PoliciesGuard
          useValue: mockPoliciesGuard,
        },
        {
          provide: CaslAbilityFactory, // Mocka explicitamente o CaslAbilityFactory
          useValue: mockCaslAbilityFactory,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        new UserEntity({ id: 1, name: 'John Doe', email: 'john@example.com' }),
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = new CreateUserDto();
      const mockUser = new UserEntity({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      });
      jest.spyOn(service, 'create').mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(new UserEntity(mockUser));
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const mockUser = new UserEntity({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(new UserEntity(mockUser));
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = new UpdateUserDto();
      const mockUser = new UserEntity({
        id: 1,
        name: 'John Updated',
        email: 'john.updated@example.com',
      });
      jest.spyOn(service, 'update').mockResolvedValue(mockUser);

      const result = await controller.update(1, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(new UserEntity(mockUser));
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const mockUser = new UserEntity({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      });
      jest.spyOn(service, 'remove').mockResolvedValue(mockUser);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(new UserEntity(mockUser));
    });
  });
});
