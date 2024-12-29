import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {APIResponse, errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import {ConnectedAccount, Creator} from "../../../src/lib/supabase-types";
import {Post} from "../../../src/utils/Phyllo/Types/Post";
import {CreatorProfile} from "../../../src/utils/Phyllo/Types/CreatorProfile";

export class SyncBrandsEndpoint extends Endpoint {
    protected readonly description: string = "Sync the data for all the brands.";
    protected readonly group: Groups = Groups.Brands
    protected readonly method: string = 'get'
    protected readonly route: string = '/brands/sync'
    protected schema: ZodObject<any> = z.object({
        started: z.boolean()
    });

    private brandContentMap = {};
    private brandProfilesList: CreatorProfile[] = [];

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
            this.brandContentMap = {};
            this.brandProfilesList = [];
            const creators = await this.getPrisma().creators.findMany({
                where: {
                    brand_id: brand.id,
                    status: {
                        not: 'pending'
                    }
                }
            });

            for (const creator of creators) {
                try {
                    const synced = await this.scyncCreator(<Creator>creator);
                    syncedCreators.set(creator.id, synced)
                } catch (error) {
                    console.log(error);
                    syncedCreators.set(creator.id, false)
                }
            }
            await this.storeInCache(`brands.${brand.id}.content`, this.brandContentMap);
            await this.storeInCache(`brands.${brand.id}.profiles`, this.brandProfilesList);
        }

        console.log('we are done syncing');
    }

    private async scyncCreator(creator: Creator): Promise<boolean> {
        const creatorAccountReqeust: APIResponse<ConnectedAccount> = await this.getPhyllo().accounts().getAccountById(creator.id);
        if (!creatorAccountReqeust.success) return false;

        const account_id = creatorAccountReqeust.data.account_id

        const refreshProfileRequest = await this.getPhyllo().profiles().refreshAccountById(account_id);
        const refreshContentRequest = await this.getPhyllo().content().refreshContentFor(account_id);

        const profileRequest: APIResponse<CreatorProfile> = await this.getPhyllo().profiles().getByAccountId(account_id);
        const contentRequest: APIResponse<Post[]> = await this.getPhyllo().content().getContentList(account_id, 90);
        const demographicsRequest = await this.getPhyllo().profiles().getDemographicsByAccountId(account_id);

        if (contentRequest.success) {
            await this.storeInCache(`${creator.id}.content`, contentRequest.data);

            //@todo fix build error
            //@ts-ignore
            this.brandContentMap[creator.id] = contentRequest.data;
        }
        if (profileRequest.success) {
            let profile = profileRequest.data;
            profile.id = creator.id;
            this.brandProfilesList.push(profileRequest.data);
            await this.storeInCache(`${creator.id}.profile`, profileRequest.data);
        }
        if(demographicsRequest.success) {
            await this.storeInCache(`${creator.id}.demographics`, demographicsRequest);
        }
        return true;
    }
}