export interface SwaggerSetup {
  url?: string;
  title?: string;
  description?: string;
  tag?: string;
  version?: string;
  addServer?: string[];
  isAuthBear?: boolean;
  persistAuthorization?: boolean;
}
