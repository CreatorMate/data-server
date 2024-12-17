import {Context} from "hono";
import Redis from "ioredis";
import {Endpoint} from "../../../src/utils/Endpoint";
import {APIResponse, errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import {Groups} from "../../../src/lib/enums";
import {undefined, z, ZodObject} from "zod";
import {CreatorProfile} from "../../../src/utils/Phyllo/Types/CreatorProfile";

export class GetCreatorProfileEndpoint extends Endpoint {
    protected readonly method: string = 'get';
    protected readonly route: string = '/profiles/:id';
    protected readonly description: string = 'fetch an instagram profile';
    protected readonly group: Groups = Groups.Profiles;
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


        const cache = await this.getFromCache(key);
        if (cache) {
            return successResponse(context, cache);
        }

        const getConnectedAccount = await this.getPhyllo().accounts().getAccountById(id);

        if(!getConnectedAccount.success) {
            return errorResponse(context, getConnectedAccount.error, 404);
        }

        const response: APIResponse<CreatorProfile> = await this.getPhyllo().profiles().getByAccountId(getConnectedAccount.data.account_id);

        if (!response.success) return errorResponse(context, id);

        await this.storeInCache(key, response.data);

        return successResponse(context, response.data);
    }


}