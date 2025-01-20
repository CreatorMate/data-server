import {Post} from "../utils/Phyllo/Types/Post";
import {CreatorProfile} from "../utils/Phyllo/Types/CreatorProfile";
import {PrismaClient} from "@prisma/client";
import {APIResponse} from "../utils/APIResponse/HttpResponse";
import {ConnectedAccount} from "../lib/supabase-types";
import {PhylloClient} from "../utils/Phyllo/PhylloClient";
import {RedisClient, useRedis} from "../lib/redis";
import {Demographics} from "../utils/Phyllo/Types/Demographics";

export default class CreatorManager {
    creatorId: string;
    redis: RedisClient;

    constructor(creatorId: string, prismaClient: PrismaClient) {
        this.creatorId = creatorId;
        this.redis = useRedis();
    }

    async syncCreator(): Promise<{posts: Post[], profile: CreatorProfile, demographics: Demographics}> {
        const phyllo =  new PhylloClient();
        const creatorAccountReqeust: APIResponse<ConnectedAccount> = await phyllo.accounts().getAccountById(this.creatorId);
        if (!creatorAccountReqeust.success) {
            throw Error(`no creator with the id of ${this.creatorId}`);
        }

        const account_id = creatorAccountReqeust.data.account_id;

        const refreshProfileRequest = await phyllo.profiles().refreshAccountById(account_id);
        const refreshContentRequest = await phyllo.content().refreshContentFor(account_id);

        const profileRequest: APIResponse<CreatorProfile> = await phyllo.profiles().getByAccountId(account_id);

        if(!profileRequest.success) {
            throw new Error('invalid creator account');
        }

        const contentRequest: APIResponse<Post[]> = await phyllo.content().getContentList(account_id, profileRequest.data, 90,);
        const demographicsRequest: APIResponse<Demographics> = await phyllo.profiles().getDemographicsByAccountId(account_id);

        if (contentRequest.success) {
            await this.redis.storeInCache(`${this.creatorId}.content`, contentRequest.data);
        }
        if (profileRequest.success) {
            profileRequest.data.id = this.creatorId;
            await this.redis.storeInCache(`${this.creatorId}.profile`, profileRequest.data);
        }
        if(demographicsRequest.success) {
            await this.redis.storeInCache(`${this.creatorId}.demographics`, demographicsRequest);
        }

        if(!demographicsRequest.success || !profileRequest.success || !contentRequest.success) {
            throw new Error(`something went wrong while trying to sync creator: ${this.creatorId}`);
        }

        return {
            posts: contentRequest.data,
            profile: profileRequest.data,
            demographics: demographicsRequest.data
        }
    }
}