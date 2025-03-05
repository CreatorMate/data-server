import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {APIResponse, errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";

export class GetCreatorProfileDemographicsEndpoint extends Endpoint {
    protected readonly method: string = 'get'
    protected readonly route: string = '/profiles/:id/demographics'
    protected readonly group: Groups = Groups.Profiles
    protected readonly description: string = 'Get the demographics of a specific profile';
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const id = context.req.param('id') as string;
        // if(!id) return errorResponse(context, "Must provide a valid id");
        // const key = `${id}.demographics`;
        //
        // const demographicsCache = await this.getFromCache(key);
        // if(demographicsCache) {
        //     return successResponse(context, demographicsCache);
        // }
        //
        // const accountRequest: APIResponse = await this.getPhyllo().accounts().getAccountById(id);
        // if(!accountRequest.success) return errorResponse(context, accountRequest.error);
        //
        // const demographicsRequest = await this.getPhyllo().profiles().getDemographicsByAccountId(accountRequest.data.account_id);
        // if(!demographicsRequest.success) return errorResponse(context, demographicsRequest.error);
        //
        // await this.storeInCache(key, demographicsRequest.data);

        return successResponse(context, '');
    }
}