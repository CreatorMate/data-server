import {Context, Next} from "hono";
import env from "../env";

const excludedPaths = ['/doc', '/reference'];

export async function authenticationMiddleware(context: Context, next: Next): Promise<any> {
    if(excludedPaths.includes(context.req.path)) {
        return next();
    }

    const authHeader = context.req.header('Authorization');
    if (authHeader !== `Bearer ${env?.API_KEY}`) {
        return context.json({ error: 'Unauthorized' }, 401);
    }

    return next();
}