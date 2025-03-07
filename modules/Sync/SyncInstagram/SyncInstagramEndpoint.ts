import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import CreatorManager from "../../../src/managers/CreatorManager";
import BrandManager from "../../../src/managers/BrandManager";
import {Creator} from "../../../src/lib/supabase-types";
import {InstagramManager} from "../../../src/utils/InstagramConnector/InstagramManager";
import {processInBatches} from "../../../src/utils/uutils";
import {InstagramConnector} from "../../../src/utils/InstagramConnector/InstagramConnector";

export class SyncInstagramEndpoint extends Endpoint {
    protected readonly description: string = 'sync all the creators data to the cloud'
    protected readonly group: Groups = Groups.Refresh;
    protected readonly method: string = 'get'
    protected readonly route: string = '/sync/instagram'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const {brandId, creatorId} = context.req.query();
        if (creatorId) {
            const creator = await this.getPrisma().creators.findUnique({
                where: {id: creatorId}
            });
            if (!creator || !creator.instagram_id) return;
            this.syncCreator(creator).catch(err => console.error('Background task error:', err));
        } else if (brandId) {
            this.syncBrand(Number(brandId)).catch(err => console.error('Background task error:', err));
        } else {
            this.syncAll().catch(err => console.error('Background task error:', err));
        }


        return successResponse(context, {
            'started': true
        });
    }

    private async syncBrand(id: number) {
        const idsStoSync: { id: string, instagramId: number }[] = [];

        const brand = await this.getPrisma().brands.findUnique({
            where: {id: id},
        });

        if (!brand || !brand.instagram_id) return;

        idsStoSync.push({id: brand.id.toString(), instagramId: brand.instagram_id});

        const creators = await this.getActiveCreators(id);
        for (const creator of creators) {
            if (!creator.instagram_id) continue;
            idsStoSync.push({id: creator.id, instagramId: creator.instagram_id});
        }

        for (const item of idsStoSync) {
            const instagramManager = new InstagramManager(item.id, item.instagramId);
            await instagramManager.syncInstagram();
        }

        const brandManager = new BrandManager(id, this.getPrisma());
        await brandManager.syncBrand(idsStoSync);
    }

    private async syncCreator(creator: any) {
        try {
            const instagramManager = new InstagramManager(creator.id, creator.instagram_id);
            await instagramManager.syncInstagram();
            const profile = await InstagramConnector.accounts().getProfile(creator.id);
            const content = await InstagramConnector.content().getContentList(creator.id);

            const brandPartnerships = await this.getBrandPartnerships(creator.id);
            for(const brand of brandPartnerships) {
                const brandManager = new BrandManager(brand.id, this.getPrisma());
                await brandManager.addPostsToBrand(creator.id, content);
                await brandManager.addProfilesToBrand(creator.id, profile);
            }
        } catch (e) {
            console.error(`there was a problem while syncing creator ${creator.email} ${e}`);
        }
    }

    private async syncAll() {
        const idsToSync: { id: string, instagramId: number }[] = [];
        const creators = await this.getPrisma().creators.findMany({
            where: {
                instagram_id: {
                    not: null
                }
            }
        });
        const brands = await this.getPrisma().brands.findMany({
            where: {
                instagram_id: {
                    not: null
                }
            }
        });
        idsToSync.push(
            ...brands
                .map(brand => ({
                    id: brand.id.toString(),
                    instagramId: brand.instagram_id as number
                }))
        );
        idsToSync.push(
            ...creators
                .map(creator => ({
                    id: creator.id,
                    instagramId: creator.instagram_id as number
                }))
        );

        for (const idToSync of idsToSync) {
            const instagramManager = new InstagramManager(idToSync.id, idToSync.instagramId);
            await instagramManager.syncInstagram();
        }

        for(const brand of brands) {
            const brandIdsToSync: { id: string, instagramId: number }[] = [];
            brandIdsToSync.push({id: brand.id.toString(), instagramId: brand.instagram_id as number});
            const brandCreators = await this.getActiveCreators(brand.id);
            for (const creator of brandCreators) {
                if (!creator.instagram_id) continue;
                brandIdsToSync.push({id: creator.id, instagramId: creator.instagram_id});
            }

            const brandManager = new BrandManager(brand.id, this.getPrisma());
            await brandManager.syncBrand(brandIdsToSync);
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

    private async syncInstagramBatch(idsToSync: { id: string; instagramId: number }[], batchSize: number) {
        await processInBatches(idsToSync, batchSize, async ({id, instagramId}) => {
            const instagramManager = new InstagramManager(id, instagramId);
            return instagramManager.syncInstagram();
        });

        console.log("All Instagram accounts synced!");
    }
}