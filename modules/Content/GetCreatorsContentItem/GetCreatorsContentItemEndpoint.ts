import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";

export class GetCreatorsContentItemEndpoint extends Endpoint {
    protected readonly method: string = 'get'
    protected readonly route: string = '/profiles/:id/content/:content_id'
    protected readonly group: Groups = Groups.Profiles
    protected readonly description: string = 'Get the profile(s) demographics';
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const id = context.req.param('content_id') as string;
        if(!id) return errorResponse(context, "Must provide a valid id");

        const contentRequest = await this.getPhyllo().content().getContentById(id);
        if(!contentRequest.success) return errorResponse(context, contentRequest.error);

        return successResponse(context, contentRequest.data);
    }
}