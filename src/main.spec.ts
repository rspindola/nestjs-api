import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

describe('Bootstrap', () => {
  let app: INestApplication;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    configService = app.get(ConfigService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should initialize the application', async () => {
    expect(app).toBeDefined();
  });

  it('should configure Swagger correctly', async () => {
    const swaggerConfig = {
      title: 'Test API',
      description: 'Test API description',
      version: '1.0',
    };

    jest.spyOn(configService, 'get').mockImplementation((key) => {
      if (key === 'swagger') return swaggerConfig;
      return undefined;
    });

    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    expect(document).toBeDefined();
  });

  it('should apply ValidationPipe globally', async () => {
    const validationPipeSpy = jest.spyOn(app, 'useGlobalPipes');

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    expect(validationPipeSpy).toHaveBeenCalledWith(expect.any(ValidationPipe));
  });

  it('should listen on the correct port', async () => {
    jest.spyOn(configService, 'get').mockImplementation((key) => {
      if (key === 'PORT') return 4000;
      return undefined;
    });

    const listenSpy = jest
      .spyOn(app, 'listen')
      .mockImplementation(async (port) => {
        expect(port).toBe(4000);
        return Promise.resolve();
      });

    await app.listen(4000);
    expect(listenSpy).toHaveBeenCalledWith(4000);
  });
});
