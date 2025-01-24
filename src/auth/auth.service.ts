/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entity/auth.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private generateTokens(userId: number) {
    const jwtAccessSecret = this.configService.get<string>(
      'security.jwtAccessSecret',
    );
    const jwtRefreshSecret = this.configService.get<string>(
      'security.jwtRefreshSecret',
    );
    const jwtAccessExpiration = this.configService.get<string>(
      'security.jwtAccessExpiration',
    );
    const jwtRefreshExpiration = this.configService.get<string>(
      'security.jwtRefreshExpiration',
    );

    const accessToken = this.jwtService.sign(
      { userId },
      {
        secret: jwtAccessSecret,
        expiresIn: jwtAccessExpiration,
      },
    );

    const refreshToken = this.jwtService.sign(
      { userId },
      {
        secret: jwtRefreshSecret,
        expiresIn: jwtRefreshExpiration,
      },
    );

    return { accessToken, refreshToken };
  }

  async signUp(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthEntity> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.usersService.create({
        name,
        email,
        password: hashedPassword,
      });

      return this.generateTokens(user.id);
    } catch (e) {
      if (e.code === 'P2002') {
        throw new ConflictException(`Email ${email} already used.`);
      }
      throw new Error(e);
    }
  }

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return this.generateTokens(user.id);
  }

  async refresh(refreshToken: string): Promise<AuthEntity> {
    try {
      const jwtRefreshSecret = this.configService.get<string>(
        'security.jwtRefreshSecret',
      );

      const payload = this.jwtService.verify(refreshToken, {
        secret: jwtRefreshSecret,
      });

      const userId = Number(payload.userId);

      return this.generateTokens(userId);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
