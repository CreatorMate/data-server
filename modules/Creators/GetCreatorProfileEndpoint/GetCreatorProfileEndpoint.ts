import {Context} from "hono";
import Redis from "ioredis";
import {Endpoint} from "../../../src/utils/Endpoint";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import {Groups} from "../../../src/lib/enums";
import {undefined, z, ZodObject} from "zod";
import env from "../../../src/env";
import {CreatorProfile} from "../../../src/lib/types";

export class GetCreatorProfileEndpoint extends Endpoint {
    protected readonly method: string = 'get'
    protected readonly route: string = '/creators/profile/:id'
    protected readonly description: string = 'fetch an instagram profile'
    protected readonly group: Groups = Groups.CREATORS;
    protected schema: ZodObject<any> = z.object({
        username: z.string(),
        platform_username: z.string(),
        full_name: z.string(),
        profile_url: z.string(),
        description: z.string(),
        picture: z.string(),
        date_of_birth: z.string().nullable(),
        platform_account_type: z.string().nullable(),
        category: z.string(),
        followers: z.number(),
        following: z.number(),
        posts: z.string(),
        gender: z.string().nullable(),
        country: z.string().nullable(),
        is_verified: z.boolean(),
        website: z.string()
    })

    protected async handle(context: Context) {
        const id = context.req.param('id') as string;
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
        const cache = await this.getFromCache(key);
        if (cache) {
            return successResponse(context, cache);
        }

        const getConnectedAccount = await this.getPhyllo().accounts().getAccountById(id);

        if(!getConnectedAccount.success) {
            return errorResponse(context, getConnectedAccount.error, 404);
        }

        const response = await this.getPhyllo().profiles().getByAccountId(getConnectedAccount.data.account_id);

        //@ts-ignore
        if (!response.success) return errorResponse(context, id as string);

        const profile = this.toCreatorProfile(response.data.data[0]);

        await this.storeInCache(key, profile);

        return successResponse(context, profile);
    }

    private toCreatorProfile(data: any): CreatorProfile {
        return {
            username: data.username,
            platform_username: data.platform_username,
            full_name: data.full_name,
            description: data.introduction,
            picture: data.image_url,
            followers: data.reputation.follower_count,
            following: data.reputation.following_count,
            website: data.websitem,
            category: data.category,
            country: data.country,
            date_of_birth: data.date_of_birth,
            gender: data.gender,
            is_verified: data.is_verified,
            platform_account_type: data.platform_account_type,
            posts: data.reputation.content_count,
            profile_url: data.url,
        }
    }
}