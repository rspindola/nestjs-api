import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto, SignUpDto } from './dto/create-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  @ApiOkResponse({ type: AuthEntity })
  signUp(@Body() { name, email, password }: SignUpDto) {
    return this.authService.signUp(name, email, password);
  }

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  async logout(@Req() req) {
    return new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) {
          return reject(err);
        }
        resolve({ message: 'Logout realizado com sucesso!' });
      });
    });
  }
}
