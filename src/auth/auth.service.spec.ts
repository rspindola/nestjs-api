import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt'); // Mocka o bcrypt

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              const config = {
                'security.jwtAccessSecret': 'access-secret',
                'security.jwtRefreshSecret': 'refresh-secret',
                'security.jwtAccessExpiration': '15m',
                'security.jwtRefreshExpiration': '7d',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signUp', () => {
    it('should create a user and return tokens', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      };
      const hashedPassword = 'mocked-hashed-password'; // Valor fixo para o hash
      const user = {
        id: 1,
        name: signUpDto.name,
        email: signUpDto.email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: null,
      };

      // Mock do bcrypt.hash
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Mock do usersService.create
      jest.spyOn(usersService, 'create').mockResolvedValue(user);

      // Mock do jwtService.sign
      jest.spyOn(jwtService, 'sign').mockReturnValue('test-token');

      const result = await authService.signUp(
        signUpDto.name,
        signUpDto.email,
        signUpDto.password,
      );

      expect(result).toEqual({
        accessToken: 'test-token',
        refreshToken: 'test-token',
      });
      expect(usersService.create).toHaveBeenCalledWith({
        name: signUpDto.name,
        email: signUpDto.email,
        password: hashedPassword, // Agora será consistente
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      };

      jest.spyOn(usersService, 'create').mockRejectedValue({ code: 'P2002' });

      await expect(
        authService.signUp(signUpDto.name, signUpDto.email, signUpDto.password),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw a generic error for unexpected exceptions', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      };

      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(
        authService.signUp(signUpDto.name, signUpDto.email, signUpDto.password),
      ).rejects.toThrow(Error);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const loginDto = { email: 'john@example.com', password: '123456' };
      const user = {
        id: 1,
        email: loginDto.email,
        password: await bcrypt.hash(loginDto.password, 10),
      };

      // Mock do usersService.findByEmail
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);

      // Mock do bcrypt.compare
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      // Mock do generateTokens
      const generateTokensSpy = jest
        .spyOn(authService as any, 'generateTokens')
        .mockReturnValue({
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        });

      const result = await authService.login(loginDto.email, loginDto.password);

      expect(result).toEqual({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      });

      expect(generateTokensSpy).toHaveBeenCalledWith(user.id); // Verifica se generateTokens foi chamado com o ID correto
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const loginDto = { email: 'john@example.com', password: '123456' };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(
        authService.login(loginDto.email, loginDto.password),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = { email: 'john@example.com', password: '123456' };
      const user = {
        id: 1,
        email: loginDto.email,
        password: await bcrypt.hash('wrong-password', 10),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        authService.login(loginDto.email, loginDto.password),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw a generic error for unexpected exceptions during login', async () => {
      const loginDto = { email: 'john@example.com', password: '123456' };

      jest
        .spyOn(usersService, 'findByEmail')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(
        authService.login(loginDto.email, loginDto.password),
      ).rejects.toThrow(Error);
    });
  });

  describe('refresh', () => {
    it('should return new tokens for valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { userId: 1 };

      // Mock do jwtService.verify para retornar um payload válido
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new-test-token');

      const result = await authService.refresh(refreshToken);

      expect(result).toEqual({
        accessToken: 'new-test-token',
        refreshToken: 'new-test-token',
      });
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: 'refresh-secret',
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2); // Gera accessToken e refreshToken
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      // Mock do jwtService.verify para lançar um erro
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error();
      });

      await expect(authService.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
