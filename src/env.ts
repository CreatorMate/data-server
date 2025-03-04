import {z} from "zod";
import {expand} from "dotenv-expand";
import {config} from "dotenv";

expand(config());

const EnvSchema = z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(3000),
    API_KEY: z.string(),
    DATABASE_URL: z.string(),
    ENCRYPTION_KEY: z.string(),
    PHYLLO_KEY: z.string(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number().default(6380),
    REDIS_PASSWORD: z.string(),
    MAILER_DRIVER: z.string().default('smtp'),
    MAILER_HOST: z.string(),
    MAILER_PORT: z.coerce.number().default(465),
    MAILER_USER: z.string(),
    META_CLIENT_ID: z.string(),
    META_REDIRECT_URL: z.string(),
    META_CLIENT_SECRET: z.string(),
    AZURE_AI_KEY: z.string()
});

export type env = z.infer<typeof EnvSchema>;

const {data: env, error} = EnvSchema.safeParse(process.env);

if (error) {
    console.error("❌ Invalid env:");
    console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
    process.exit(1);
}
export default env;