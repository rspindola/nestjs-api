import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { Action } from '../casl/enum';

@Controller('users')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'User'))
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async findAll() {
    const users = await this.usersService.findAll();
    return users;
  }

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'User'))
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto) {
    return new UserEntity(await this.usersService.create(createUserDto));
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'User'))
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return new UserEntity(await this.usersService.findOne(id));
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'User'))
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return new UserEntity(await this.usersService.update(id, updateUserDto));
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'User'))
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return new UserEntity(await this.usersService.remove(id));
  }

  @Post(':id/assign-role')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Role'))
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  async assignRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body('roleName') roleName: string,
    @Request() req,
  ) {
    const currentUser = req.user;
    return this.usersService.assignRole(userId, roleName, currentUser);
  }
}
