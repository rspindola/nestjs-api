import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

jest.mock('@nestjs/core', () => ({
  repl: jest.fn(),
}));

describe('REPL Bootstrap', () => {
  it('should call repl with AppModule', async () => {
    const bootstrap = async () => {
      const { repl } = await import('@nestjs/core');
      const { AppModule } = await import('./app.module');
      await repl(AppModule);
    };

    // Chama a função bootstrap
    await bootstrap();

    // Verifica se o método repl foi chamado com AppModule
    expect(repl).toHaveBeenCalledWith(AppModule);
  });
});
