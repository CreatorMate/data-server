import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {successResponse} from "../../../src/utils/APIResponse/HttpResponse";

export class SyncBrandsEndpoint extends Endpoint {
    protected readonly description: 'Sync the data for all the brands.';
    protected readonly group: Groups = Groups.Brands
    protected readonly method: string = 'get'
    protected readonly route: string = '/brands/sync'
    protected schema: ZodObject<any> = z.object({
        started: z.boolean()
    })

    protected handle(context: Context): any {
        return successResponse(context, {
            started: true
        })
    }

}