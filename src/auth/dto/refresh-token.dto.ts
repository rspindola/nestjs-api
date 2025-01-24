import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token used to generate a new access token',
    example: 'your_refresh_token_here',
  })
  @IsString()
  refreshToken: string;
}
