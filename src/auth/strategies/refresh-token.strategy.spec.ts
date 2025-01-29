import { RefreshTokenStrategy } from './refresh-token.strategy';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

describe('RefreshTokenStrategy', () => {
  let refreshTokenStrategy: RefreshTokenStrategy;
  let configService: Partial<ConfigService>;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'security.jwtRefreshSecret') {
          return 'test-refresh-secret';
        }
        return null;
      }),
    };

    refreshTokenStrategy = new RefreshTokenStrategy(
      configService as ConfigService,
    );
  });

  it('should be defined', () => {
    expect(refreshTokenStrategy).toBeDefined();
  });

  it('should initialize with correct secret key', () => {
    expect(configService.get).toHaveBeenCalledWith('security.jwtRefreshSecret'); // Verifica se a chave foi buscada
  });

  describe('validate', () => {
    it('should return payload with refresh token', async () => {
      const mockRequest = {
        get: jest.fn().mockReturnValue('Bearer test-refresh-token'),
      } as unknown as Request;

      const payload = { userId: 1 };
      const result = await refreshTokenStrategy.validate(mockRequest, payload);

      expect(result).toEqual({
        ...payload,
        refreshToken: 'test-refresh-token',
      });
      expect(mockRequest.get).toHaveBeenCalledWith('Authorization'); // Verifica se o cabeçalho foi acessado
    });
  });
});
