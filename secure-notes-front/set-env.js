import { writeFileSync } from 'fs';
import { config } from 'dotenv';

config(); // Charge .env

const targetPath = './src/environments/environment.ts';
const targetPathDev = './src/environments/environment.development.ts';

const envConfig = `
export const environment = {
  production: false,
  secretKey: '${process.env['SECRET_KEY'] || ''}',
  apiUrl: '${process.env['API_URL'] || ''}',
  appEnv: '${process.env['APP_ENV'] || 'development'}',
};
`;

const envConfigProd = `
export const environment = {
  production: true,
  secretKey: '${process.env['SECRET_KEY'] || ''}',
  apiUrl: '${process.env['API_URL'] || ''}',
  appEnv: '${process.env['APP_ENV'] || 'production'}',
};
`;

writeFileSync(targetPath, envConfigProd);
writeFileSync(targetPathDev, envConfig);

console.log('Environment files generated successfully!');