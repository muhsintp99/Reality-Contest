import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/reality_contest'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().default('your_super_secret_access_token_12345_rcp_prod_key'),
  JWT_REFRESH_SECRET: z.string().default('your_super_secret_refresh_token_67890_rcp_prod_key'),
  ACCESS_TOKEN_EXPIRY: z.string().default('7d'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment configuration validation failed:', parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;
export default config;
