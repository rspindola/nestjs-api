import config from './config';

describe('Config', () => {
  it('should load environment variables correctly', () => {
    process.env.PORT = '4000';
    process.env.ROUNDS_OF_HASHING = '12';
    process.env.JWT_ACCESS_SECRET = 'access-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
    process.env.JWT_ACCESS_EXPIRATION = '20m';
    process.env.JWT_REFRESH_EXPIRATION = '10d';

    const result = config();

    expect(result.PORT).toBe(4000);
    expect(result.security.roundsOfHashing).toBe('12');
    expect(result.security.jwtAccessSecret).toBe('access-secret');
    expect(result.security.jwtRefreshSecret).toBe('refresh-secret');
    expect(result.security.jwtAccessExpiration).toBe('20m');
    expect(result.security.jwtRefreshExpiration).toBe('10d');
  });

  it('should use default values when environment variables are missing', () => {
    delete process.env.PORT;
    delete process.env.ROUNDS_OF_HASHING;
    delete process.env.JWT_ACCESS_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.JWT_ACCESS_EXPIRATION;
    delete process.env.JWT_REFRESH_EXPIRATION;

    const result = config();

    expect(result.PORT).toBe(3000);
    expect(result.security.roundsOfHashing).toBe('10');
    expect(result.security.jwtAccessSecret).toBeUndefined();
    expect(result.security.jwtRefreshSecret).toBeUndefined();
    expect(result.security.jwtAccessExpiration).toBe('15m');
    expect(result.security.jwtRefreshExpiration).toBe('7d');
  });
});
