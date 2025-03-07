import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {APIResponse, errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import {ConnectedAccount, Creator} from "../../../src/lib/supabase-types";
import {Post} from "../../../src/utils/Phyllo/Types/Post";
import {CreatorProfile} from "../../../src/utils/Phyllo/Types/CreatorProfile";
import BrandManager from "../../../src/managers/BrandManager";

export class SyncBrandsEndpoint extends Endpoint {
    protected readonly description: string = "Sync the data for all the brands.";
    protected readonly group: Groups = Groups.Brands
    protected readonly method: string = 'get'
    protected readonly route: string = '/brands/sync'
    protected schema: ZodObject<any> = z.object({
        started: z.boolean()
    });

    // private brandContentMap = {};
    // private brandProfilesList: CreatorProfile[] = [];

    protected async handle(context: Context) {
        this.sync().catch(err => console.error('Background task error:', err));

        return successResponse(context, {
           'started': true
        });
    }

    private async sync() {
        const brands = await this.getPrisma().brands.findMany();
        const syncedCreators = new Map<string, boolean>();
        for (const brand of brands) {
            const brandManager = new BrandManager(brand.id, this.getPrisma());
            // await brandManager.syncBrand();
        }
    }
}