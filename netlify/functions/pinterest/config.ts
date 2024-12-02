import { z } from 'zod';

export const PINTEREST_API_URL = 'https://api.pinterest.com/v5';

const configSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string().url(),
});

export type PinterestConfig = z.infer<typeof configSchema>;

export function validateConfig(config: unknown): PinterestConfig {
  return configSchema.parse(config);
}