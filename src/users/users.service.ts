import {
  ConflictException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppAbility, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Action } from '../casl/enum';

@Injectable()
export class UsersService {
  private readonly roundsOfHashing: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {
    this.roundsOfHashing = parseInt(
      this.configService.get<string>('security.roundsOfHashing', '10'),
      10,
    );
  }

  async assignRole(userId: number, roleName: string, currentUser: any) {
    const ability: AppAbility =
      this.caslAbilityFactory.createForUser(currentUser);

    if (!ability.can(Action.Update, 'Role')) {
      throw new ForbiddenException(
        'You do not have permission to assign roles.',
      );
    }

    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });
    if (!role) throw new Error(`Role ${roleName} not found`);

    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.roundsOfHashing,
    );

    createUserDto.password = hashedPassword;

    try {
      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('This email is already in use.');
      }
      throw error;
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map(({ password, ...result }) => result);
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<any> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        this.roundsOfHashing,
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
