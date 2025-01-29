import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Action } from './enum';
import { UserEntity } from '../users/entities/user.entity';
import { Role } from '@prisma/client'; // Role do Prisma

// Adicione "export" ao tipo Subjects
export type Subjects =
  | InferSubjects<typeof UserEntity>
  | 'all'
  | 'User'
  | 'Role';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: UserEntity): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (user.role?.name === 'admin') {
      can(Action.Manage, 'all'); // Admin pode fazer tudo
    } else if (user.role?.permissions) {
      user.role.permissions.forEach((permission) => {
        const [action, subject] = permission.name.split('@');

        can(action as Action, subject as ExtractSubjectType<Subjects>);
      });
    }

    return build({
      detectSubjectType: (item) => {
        if (item instanceof UserEntity) {
          return 'User';
        }

        if ((item as Role)?.name) {
          return 'Role';
        }

        return 'all';
      },
    });
  }
}
