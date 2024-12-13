import {Endpoint} from "../../../utils/Endpoint";
import {Context} from "hono";
import {errorResponse, successResponse} from "../../../utils/APIResponse/HttpResponse";
import {useRedis} from "../../../app";
import {cache} from "hono/dist/types/middleware/cache";
import Redis from "ioredis";

export class GetCreatorProfileEndpoint extends Endpoint {
    protected readonly method: string = 'get'
    protected readonly route: string = '/creators/profile/:id'

    protected async handle(context: Context) {
        const id = context.req.param('id');
        const key = `${id}.profile`;
        //@ts-ignore
        const redis = new Redis({
            //@ts-ignore
            host: process.env.REDIS_HOST,
            //@ts-ignore
            port: process.env.REDIS_PORT,
            //@ts-ignore
            password: process.env.REDIS_PASSWORD,
            //@ts-ignore
            tls: {},
        });
        //@ts-ignore
        const cachedProfile = JSON.parse(await redis.get(key));
        if (cachedProfile && Object.keys(cachedProfile).length > 0) {
            return successResponse(context, cachedProfile);
        }

        const result = await this.prismaClient.creators.findFirst({
            //@ts-ignore
            where: {id: id}
        });

        const result2 = await this.prismaClient.phyllo_connections.findFirst({
            //@ts-ignore
            where: {id: 'CREATOR'+result.id}
        });

        //@ts-ignore
        const result3 = await this.prismaClient.connected_accounts.findFirst({
            //@ts-ignore
            where: {user_id: result2.user_id}
        });

        //@ts-ignore
        const response = await fetch(`https://api.staging.getphyllo.com/v1/accounts/${result3.account_id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${process.env.PHYLLO_KEY}`
            }
        });

        //@ts-ignore
        if (!response.ok) return errorResponse(context, result3?.account_id);
        const profile = await response.json();

        await redis.set(key, JSON.stringify(profile), 'EX', 172800);

        return successResponse(context, profile);
    }

}