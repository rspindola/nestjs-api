import { UserEntity } from './user.entity';
import { classToPlain } from 'class-transformer';

describe('UserEntity', () => {
  it('should be defined', () => {
    const user = new UserEntity({});
    expect(user).toBeDefined();
  });

  it('should initialize properties correctly from partial input', () => {
    const partialData = {
      id: 1,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'secret',
      roleId: null,
    };

    const user = new UserEntity(partialData);

    expect(user.id).toBe(partialData.id);
    expect(user.createdAt).toEqual(partialData.createdAt);
    expect(user.updatedAt).toEqual(partialData.updatedAt);
    expect(user.name).toBe(partialData.name);
    expect(user.email).toBe(partialData.email);
    expect(user.password).toBe(partialData.password);
    expect(user.roleId).toBe(partialData.roleId);
  });

  it('should exclude the password field when serialized', () => {
    const partialData = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'secret',
      roleId: null,
    };

    const user = new UserEntity(partialData);

    // Usa classToPlain para serializar e respeitar o @Exclude()
    const serializedUser = classToPlain(user);

    expect(serializedUser.password).toBeUndefined(); // Verifica se o campo "password" foi excluído
  });
});
