export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL ?? 'postgres://personal_website:personal_website@localhost:5432/personal_website';
}
