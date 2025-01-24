import { IsNumberString, IsString, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class EnvironmentVariables {
  @IsNumberString()
  ROUNDS_OF_HASHING: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_LIMIT_TIME: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
