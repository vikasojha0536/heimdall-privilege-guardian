
interface Environment {
  production: boolean;
  baseUrl: string;
  useAuth: boolean;
}

export const environment: Environment = {
  production: import.meta.env.PROD || false,
  baseUrl: import.meta.env.PROD ? 'https://your-prod-backend.com' : 'http://localhost:8080',
  useAuth: import.meta.env.PROD || false, // Only use auth in production
};
