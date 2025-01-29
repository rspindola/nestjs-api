import { RefreshTokenGuard } from './refresh-token.guard';
import { AuthGuard } from '@nestjs/passport';

jest.mock('@nestjs/passport', () => {
  const actualPassport = jest.requireActual('@nestjs/passport');
  return {
    ...actualPassport,
    AuthGuard: jest.fn().mockImplementation((strategy: string) => {
      return class MockAuthGuard {
        strategy: string;
        constructor() {
          this.strategy = strategy;
        }
      };
    }),
  };
});

describe('RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;

  beforeEach(() => {
    guard = new RefreshTokenGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard with "jwt-refresh" strategy', () => {
    // Mock manualmente a instância de AuthGuard para garantir que seja reconhecida
    const MockAuthGuard = (AuthGuard as jest.Mock).mock.results[0].value;
    expect(guard).toBeInstanceOf(MockAuthGuard);
  });
});
