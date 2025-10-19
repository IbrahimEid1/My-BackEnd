export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'shortline.proxy.rlwy.net'),
      port: env.int('DATABASE_PORT', 14035),
      database: env('DATABASE_NAME', 'railway'),
      user: env('DATABASE_USERNAME', 'postgres'),
      password: env('DATABASE_PASSWORD', 'wqLjEWHmftqIWSKTQcEWvGzOePuoPqEQ'),
      ssl: {
        rejectUnauthorized: false, 
      },
    },
    pool: { min: 2, max: 10 },
  },
});
