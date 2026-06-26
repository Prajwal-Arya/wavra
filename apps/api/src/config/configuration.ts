export default () => ({
  port: parseInt(process.env.API_PORT ?? "3001", 10),
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  database: {
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: parseInt(process.env.POSTGRES_PORT ?? "5432", 10),
    username: process.env.POSTGRES_USER ?? "music",
    password: process.env.POSTGRES_PASSWORD ?? "music",
    database: process.env.POSTGRES_DB ?? "music_player"
  }
});
