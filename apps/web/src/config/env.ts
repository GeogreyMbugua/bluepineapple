import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_GOOGLE_MAPS_KEY: z.string().min(1, "Google Maps API Key is required"),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(["development", "production", "test", "staging"]),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return val.toLowerCase() === "true";
      }
      return val;
    },
    z.boolean().default(false)
  ),
});

let parsedEnv: z.infer<typeof envSchema>;

try {
  parsedEnv = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    const formattedErrors = error.format();
    console.error("❌ Invalid environment variables:", JSON.stringify(formattedErrors, null, 2));
  } else {
    console.error("❌ Failed to parse environment variables:", error);
  }
  throw new Error("Invalid configuration. Check environment variables.");
}

export const env = parsedEnv;
export type Env = z.infer<typeof envSchema>;