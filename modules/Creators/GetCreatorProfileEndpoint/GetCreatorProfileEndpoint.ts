import {Context} from "hono";
import Redis from "ioredis";
import {Endpoint} from "../../../src/utils/Endpoint";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import env from "../../../src/env";
import {cache} from "hono/dist/types/middleware/cache";

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

        // const result = await this.prismaClient.creators.findFirst({
        //     //@ts-ignore
        //     where: {id: id}
        // });
        //
        // const result2 = await this.prismaClient.phyllo_connections.findFirst({
        //     //@ts-ignore
        //     where: {id: 'CREATOR'+result.id}
        // });

        // //@ts-ignore
        // const result3 = await this.prismaClient.connected_accounts.findFirst({
        //     //@ts-ignore
        //     where: {user_id: result2.user_id}
        // });

        //@ts-ignore
        const response = await fetch(`https://api.staging.getphyllo.com/v1/accounts/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${env?.PHYLLO_KEY}`
            }
        });

        //@ts-ignore
        if (!response.ok) return errorResponse(context, id);
        let profile = await response.json();

        let creatorProfile: CreatorProfile = {
            "username": profile.username,
            "platform_username": profile.platform_username,
            "profile_pic_url": profile.profile_pic_url,
            "platform_profile_name": profile.platform_profile_name,
            "platform_profile_id": profile.platform_profile_id,
        }

        await redis.set(key, JSON.stringify(creatorProfile), 'EX', 172800);

        return successResponse(context, profile);
    }
}