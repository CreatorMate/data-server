import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";

export class RefreshCreatorProfileEndpoint extends Endpoint {
    protected readonly method: string = 'put'
    protected readonly route: string = '/profiles/:id/refresh'
    protected readonly group: Groups = Groups.Profiles
    protected readonly description: string = 'Force a profile refresh';
    protected schema: ZodObject<any> = z.object({
        refreshed: z.boolean()
    });

    protected async handle(context: Context) {
        const id = context.req.param('id') as string;
        if(!id) return errorResponse(context, 'provide a valid id');

        // const creatorAccountRequest = await this.getPhyllo().accounts().getAccountById(id);
        // if(!creatorAccountRequest.success) return errorResponse(context, 'this user does not exist');
        //
        // const refreshRequest = await this.getPhyllo().profiles().refreshAccountById(creatorAccountRequest.data.account_id);
        // if(!refreshRequest.success) return errorResponse(context, 'there is a problem with the account link of this user');
        //
        // const profileRequest = await this.getPhyllo().profiles().getByAccountId(creatorAccountRequest.data.account_id);
        // if(!profileRequest.success) return errorResponse(context, 'false');
        //
        // await this.storeInCache(`${id}.profile`, profileRequest.data);

        return successResponse(context, {refreshed: true});
    }
}