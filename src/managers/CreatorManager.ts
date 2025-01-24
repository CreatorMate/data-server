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
    prismaClient: PrismaClient;

    constructor(creatorId: string, prismaClient: PrismaClient) {
        this.creatorId = creatorId;
        this.redis = useRedis();
        this.prismaClient = prismaClient;
    }

    public async getCreatorProfile() {
        return this.redis.getFromCache(`${this.creatorId}.profile`);
    }

    public async getCreatorPosts() {
        return this.redis.getFromCache(`${this.creatorId}.content`);
    }

    public async getCreatorDemographics() {
        return this.redis.getFromCache(`${this.creatorId}.demographics`);
    }

    public async syncCreator(): Promise<boolean> {
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

        await this.prismaClient.creators.update({
            where: {id: this.creatorId},
            data: {username: profileRequest.data.username}
        })

        const contentRequest: APIResponse<Post[]> = await phyllo.content().getContentList(account_id, profileRequest.data, 365);
        const demographicsRequest: APIResponse<Demographics> = await phyllo.profiles().getDemographicsByAccountId(account_id);

        if (contentRequest.success) {
            console.log(contentRequest.data.length);
            await this.redis.storeInCache(`${this.creatorId}.content`, contentRequest.data);
        }
        if (profileRequest.success) {
            profileRequest.data.id = this.creatorId;
            await this.redis.storeInCache(`${this.creatorId}.profile`, profileRequest.data);
        }
        if(demographicsRequest.success) {
            await this.redis.storeInCache(`${this.creatorId}.demographics`, demographicsRequest.data);
        }

        if(!demographicsRequest.success || !profileRequest.success || !contentRequest.success) {
            throw new Error(`something went wrong while trying to sync creator: ${this.creatorId}`);
        }

        return true;
    }
}