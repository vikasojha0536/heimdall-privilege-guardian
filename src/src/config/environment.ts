
interface Environment {
  production: boolean;
  baseUrl: string;
  useAuth: boolean;
}

export const environment: Environment = {
  production: false,
  baseUrl: import.meta.env.PROD ? 'https://heimdall-service.oneapp.dev.hal.telekom.de' : 'http://localhost:8095',
  useAuth: import.meta.env.PROD, // Only use auth in production
};
