import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule, CaslModule],
  exports: [UsersService],
})
export class UsersModule {}
