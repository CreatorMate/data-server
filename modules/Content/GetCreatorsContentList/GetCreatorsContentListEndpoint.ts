import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {APIResponse, errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";

export class GetCreatorsContentListEndpoint extends Endpoint {
    protected readonly method: string = 'get'
    protected readonly route: string = '/profiles/:id/content'
    protected readonly group: Groups = Groups.Content
    protected readonly description: string = 'Get the content of a specific creator';
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const id = context.req.param('id') as string;
        if(!id) return errorResponse(context, "Must provide a valid id");
        const key = `${id}.content`;

        const contentCache = await this.getFromCache(key);
        if(contentCache) {
            return successResponse(context, contentCache);
        }

        const accountRequest: APIResponse = await this.getPhyllo().accounts().getAccountById(id);
        if(!accountRequest.success) return errorResponse(context, accountRequest.error);

        const contentRequest = await this.getPhyllo().content().getContentList(accountRequest.data.account_id);
        if(!contentRequest.success) return errorResponse(context, contentRequest.error);

        await this.storeInCache(key, contentRequest.data);

        return successResponse(context, contentRequest.data);
    }
}