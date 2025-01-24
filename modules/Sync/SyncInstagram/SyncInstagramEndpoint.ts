import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import CreatorManager from "../../../src/managers/CreatorManager";
import BrandManager from "../../../src/managers/BrandManager";

export class SyncInstagramEndpoint extends Endpoint {
    protected readonly description: string = 'sync all the creators data to the cloud'
    protected readonly group: Groups = Groups.Refresh;
    protected readonly method: string = 'get'
    protected readonly route: string = '/sync/instagram'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        this.sync().catch(err => console.error('Background task error:', err));

        return successResponse(context, {
            'started': true
        });
    }

    private async sync() {
        const creators = await this.getPrisma().creators.findMany();
        for (const creator of creators) {
            try {
                const creatorManager = new CreatorManager(creator.id, this.getPrisma());
                const creatorData = await creatorManager.syncCreator();
            } catch (e) {
                console.error(`there was a problem while syncing creator ${creator.email} ${e}`);
            }
        }

        const brands = await this.getPrisma().brands.findMany();
        for (const brand of brands) {
            const brandManager = new BrandManager(brand.id, this.getPrisma());
            brandManager.syncBrand().catch(err => console.error(`Brand ${brand.id} sync task error:`, err));
        }
    }
}