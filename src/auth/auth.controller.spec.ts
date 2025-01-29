import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, SignUpDto } from './dto/create-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock do JwtAuthGuard
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call AuthService.signUp and return the result', async () => {
      const signUpDto: SignUpDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      };
      const result = { accessToken: 'test-access-token' };

      jest.spyOn(authService, 'signUp').mockResolvedValue(result);

      expect(await controller.signUp(signUpDto)).toEqual(result);
      expect(authService.signUp).toHaveBeenCalledWith(
        signUpDto.name,
        signUpDto.email,
        signUpDto.password,
      );
    });
  });

  describe('login', () => {
    it('should call AuthService.login and return the result', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: '123456',
      };
      const result = { accessToken: 'test-access-token' };

      jest.spyOn(authService, 'login').mockResolvedValue(result);

      expect(await controller.login(loginDto)).toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });

  describe('refresh', () => {
    it('should call AuthService.refresh and return the result', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'test-refresh-token',
      };
      const result = { accessToken: 'new-access-token' };

      jest.spyOn(authService, 'refresh').mockResolvedValue(result);

      expect(await controller.refresh(refreshTokenDto)).toEqual(result);
      expect(authService.refresh).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
    });
  });

  describe('me', () => {
    it('should return the user object from the request', async () => {
      const req = {
        user: { id: 1, name: 'John Doe', email: 'john@example.com' },
      };

      expect(controller.me(req)).toEqual(req.user);
    });
  });

  describe('logout', () => {
    it('should return true (placeholder for future implementation)', async () => {
      const req = {};
      expect(await controller.logout(req)).toBe(true);
    });
  });
});
