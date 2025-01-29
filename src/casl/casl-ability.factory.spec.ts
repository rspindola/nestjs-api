import { CaslAbilityFactory } from './casl-ability.factory';
import { UserEntity } from '../users/entities/user.entity';
import { Action } from './enum';

describe('CaslAbilityFactory', () => {
  let caslAbilityFactory: CaslAbilityFactory;

  beforeEach(() => {
    caslAbilityFactory = new CaslAbilityFactory();
  });

  it('should allow admin to manage everything', () => {
    const user = new UserEntity({
      id: 1,
      name: 'Admin',
      email: 'admin@example.com',
      role: {
        name: 'admin',
        permissions: [],
      },
    });

    const ability = caslAbilityFactory.createForUser(user);

    expect(ability.can(Action.Manage, 'all')).toBe(true);
  });

  it('should allow user with specific permissions to perform actions', () => {
    const user = new UserEntity({
      id: 2,
      name: 'User',
      email: 'user@example.com',
      role: {
        name: 'user',
        permissions: [{ name: 'read@User' }, { name: 'update@Role' }],
      },
    });

    const ability = caslAbilityFactory.createForUser(user);

    expect(ability.can(Action.Read, 'User')).toBe(true);
    expect(ability.can(Action.Update, 'Role')).toBe(true);
    expect(ability.can(Action.Delete, 'Role')).toBe(false);
  });

  it('should deny actions if no permissions are assigned', () => {
    const user = new UserEntity({
      id: 3,
      name: 'Guest',
      email: 'guest@example.com',
      role: {
        name: 'guest',
        permissions: [],
      },
    });

    const ability = caslAbilityFactory.createForUser(user);

    expect(ability.can(Action.Read, 'User')).toBe(false);
  });
});
