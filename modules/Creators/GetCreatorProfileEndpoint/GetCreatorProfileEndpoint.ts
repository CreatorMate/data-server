import {Context} from "hono";
import Redis from "ioredis";
import {Endpoint} from "../../../src/utils/Endpoint";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import env from "../../../src/env";

type CreatorProfile = {
    "username": string,
    "platform_username": string,
    "profile_pic_url": string,
    "platform_profile_name": string,
    "platform_profile_id": string,
}

export class GetCreatorProfileEndpoint extends Endpoint {
    protected readonly method: string = 'get'
    protected readonly route: string = '/creators/profile/:id'
    protected readonly description: string = 'fetch an instagram profile'
    protected readonly group: Groups = Groups.CREATORS;
    protected schema: ZodObject<any> = z.object({})

    protected async handle(context: Context) {
        const id = context.req.param('id');
        const key = `${id}.profile`;
        //@ts-ignore
        const redis = new Redis({
            host: env?.REDIS_HOST,
            //@ts-ignore
            port: env?.REDIS_PORT,
            //@ts-ignore
            password: env?.REDIS_PASSWORD,
            //@ts-ignore
            tls: {},
        });
        //@ts-ignore
        let cachedProfile = JSON.parse(await redis.get(key));
        if (cachedProfile && Object.keys(cachedProfile).length > 0) {
            return successResponse(context, cachedProfile);
        }

        const result = await this.getPrisma().creators.findFirst({
            //@ts-ignore
            where: {id: id}
        });

        if(!result) return errorResponse(context, 'no creator with this id', 404);

        const result2 = await this.getPrisma().phyllo_connections.findFirst({
            //@ts-ignore
            where: {id: 'CREATOR'+result.id}
        });

        if(!result) return errorResponse(context, 'this creator has not coupled an instagram account', 404);

        //@ts-ignore
        const result3 = await this.getPrisma().connected_accounts.findFirst({
            //@ts-ignore
            where: {user_id: result2.user_id}
        });

        //@ts-ignore
        const response = await fetch(`https://api.staging.getphyllo.com/v1/accounts/${result3.account_id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${env?.PHYLLO_KEY}`
            }
        });

        //@ts-ignore
        if (!response.ok) return errorResponse(context, id as string);
        let profile = await response.json();

        await redis.set(key, JSON.stringify(profile), 'EX', 1);

        return successResponse(context, profile);
    }
}