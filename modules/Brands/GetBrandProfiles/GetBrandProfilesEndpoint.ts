import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";

export class GetBrandProfilesEndpoint extends Endpoint {
    protected readonly description: string = "get all profiles for a specific brand"
    protected readonly group: Groups = Groups.Brands;
    protected readonly method: string = "get";
    protected readonly route: string = '/brands/:id/profiles';
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const id = context.req.param('id') as string;
        if(!id) return errorResponse(context, 'please provide a brand id', 500);

        const brandProfiles = await this.getFromCache(`brands.${id}.profiles`);

        if(!brandProfiles) return errorResponse(context, 'brand not found', 404);

        return successResponse(context, brandProfiles);
    }
}