
interface Environment {
  production: boolean;
  baseUrl: string;
  useAuth: boolean;
}

export const environment: Environment = {
  production: false,
  baseUrl: import.meta.env.PROD ? 'https://your-prod-backend.com' : 'http://localhost:8089',
  useAuth: import.meta.env.PROD, // Only use auth in production
};
