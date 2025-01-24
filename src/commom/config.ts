export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 3000,
  swagger: {
    title: 'Median',
    description: 'The Median API description',
    version: '0.1',
    authType: 'bearer',
  },
  security: {
    roundsOfHashing: process.env.ROUNDS_OF_HASHING || '10',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
});
