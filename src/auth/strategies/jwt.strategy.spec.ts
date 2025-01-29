import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersService: Partial<UsersService>;
  let configService: Partial<ConfigService>;

  beforeEach(() => {
    usersService = {
      findOne: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'security.jwtAccessSecret') {
          return 'test-secret';
        }
        return null;
      }),
    };

    jwtStrategy = new JwtStrategy(
      usersService as UsersService,
      configService as ConfigService,
    );
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should initialize with correct secret key', () => {
    expect(configService.get).toHaveBeenCalledWith('security.jwtAccessSecret'); // Verifica se o ConfigService foi chamado corretamente
  });

  describe('validate', () => {
    it('should return user if found', async () => {
      const mockUser = { id: 1, name: 'John Doe' };
      (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate({ userId: 1 });
      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(jwtStrategy.validate({ userId: 1 })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findOne).toHaveBeenCalledWith(1);
    });
  });
});
