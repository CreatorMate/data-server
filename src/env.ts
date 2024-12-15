import {z} from "zod";
import {expand} from "dotenv-expand";
import {config} from "dotenv";

expand(config())

const EnvSchema = z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(5000),
    API_KEY: z.string()
});

export type env = z.infer<typeof EnvSchema>;

const {data: env, error} = EnvSchema.safeParse(process.env);

if(error) {
    console.error("❌ Invalid env:");
    console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
    process.exit(1);
}
export default env;