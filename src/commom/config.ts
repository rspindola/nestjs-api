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
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresTime: process.env.JWT_LIMIT_TIME || '5m',
  },
});
