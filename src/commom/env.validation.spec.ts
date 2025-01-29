import 'reflect-metadata'; // Importa reflect-metadata globalmente
import { validate } from './env.validation';

describe('validate', () => {
  it('should validate the configuration successfully', () => {
    const validConfig = {
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_ACCESS_EXPIRATION: '15m',
      JWT_REFRESH_EXPIRATION: '7d',
      ROUNDS_OF_HASHING: '10',
      DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
    };

    const result = validate(validConfig);

    expect(result).toEqual(validConfig); // Verifica se o retorno é igual ao input válido
  });

  it('should throw an error if required properties are missing', () => {
    const invalidConfig = {
      JWT_ACCESS_SECRET: 'access-secret',
      // Faltam outras propriedades necessárias
    };

    expect(() => validate(invalidConfig)).toThrowError(); // Verifica se lança erro
  });

  it('should throw an error if a property has an invalid type', () => {
    const invalidConfig = {
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_ACCESS_EXPIRATION: '15m',
      JWT_REFRESH_EXPIRATION: '7d',
      ROUNDS_OF_HASHING: 'not-a-number', // Tipo inválido
      DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
    };

    expect(() => validate(invalidConfig)).toThrowError(); // Verifica se lança erro
  });
});
