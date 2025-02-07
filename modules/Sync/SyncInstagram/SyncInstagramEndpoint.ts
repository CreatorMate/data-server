import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import CreatorManager from "../../../src/managers/CreatorManager";
import BrandManager from "../../../src/managers/BrandManager";
import {Creator} from "../../../src/lib/supabase-types";

export class SyncInstagramEndpoint extends Endpoint {
    protected readonly description: string = 'sync all the creators data to the cloud'
    protected readonly group: Groups = Groups.Refresh;
    protected readonly method: string = 'get'
    protected readonly route: string = '/sync/instagram'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const {brandId, creatorId} = context.req.query();
        if(creatorId) {
            const creator = await this.getPrisma().creators.findUnique({
                where: {id: creatorId}
            });
            if(!creator) return;
            this.syncCreator(creator).catch(err => console.error('Background task error:', err));
        } else if(brandId) {
            this.syncBrand(Number(brandId)).catch(err => console.error('Background task error:', err));
        } else {
            this.syncAll().catch(err => console.error('Background task error:', err));
        }


        return successResponse(context, {
            'started': true
        });
    }

    private async syncBrand(id: number) {
        const creators = await this.getActiveCreators(id);
        for(const creator of creators) {
            await this.syncCreator(creator);
        }

        const brandManager = new BrandManager(id, this.getPrisma());
        await brandManager.syncBrand();
    }

    private async syncCreator(creator: any) {
        try {
            const creatorManager = new CreatorManager(creator.id, this.getPrisma());
            const creatorData = await creatorManager.syncCreator();

            //@todo add creators data to the right brands
            const brandPartnerships = await this.getBrandPartnerships(creator.id);
            for(const brand of brandPartnerships) {
                const brandManager = new BrandManager(brand.id, this.getPrisma());
                const profile = await creatorManager.getCreatorProfile();
                const content = await creatorManager.getCreatorPosts();
                const demographics = await creatorManager.getCreatorDemographics();

                await brandManager.addPostsToBrand(creator.id, content);
                await brandManager.addProfilesToBrand(creator.id, profile);
                await brandManager.addDemographicsToBrand(creator.id, demographics)
            }
        } catch (e) {
            console.error(`there was a problem while syncing creator ${creator.email} ${e}`);
        }
    }

    private async syncAll() {
        const creators = await this.getPrisma().creators.findMany();
        for (const creator of creators) {
           await this.syncCreator(creator);
        }

        const brands = await this.getPrisma().brands.findMany();
        for (const brand of brands) {
            const brandManager = new BrandManager(brand.id, this.getPrisma());
            await brandManager.syncBrand();
        }
    }

    public async getActiveCreators(brandId: number) {
        return this.getPrisma().creators.findMany({
            where: {
                creator_brand: {
                    some: {
                        brand_id: brandId,
                        accepted: true,
                    },
                },
            },
            include: {
                creator_brand: true, // Optional: include relationship data
            },
        });
    }

    public async getBrandPartnerships(creatorId: string) {
        return this.getPrisma().brands.findMany({
            where: {
                creator_brand: {
                    some: {
                        creator_id: creatorId,
                        accepted: true,
                    },
                },
            },
            include: {
                creator_brand: true, // Optional: include relationship data
            },
        });
    }
}