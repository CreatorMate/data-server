import {PrismaClient} from "@prisma/client";
import {RedisClient, useRedis} from "../../lib/redis";
import {usePrisma} from "../../lib/prisma";
import {decrypt} from "../Encryption/Encryptor";
import {APIResponse} from "../APIResponse/HttpResponse";
import {Post} from "../Phyllo/Types/Post";
import {InstagramConnector} from "./InstagramConnector";
import {CreatorProfile} from "../Phyllo/Types/CreatorProfile";
import {InstagramProfile} from "./types/InstagramProfile";

export class InstagramManager {
    instagramId: number;
    id: string;
    prismaClient: PrismaClient;
    redisClient: RedisClient;

    constructor(id: string, instagramId: number) {
        this.instagramId = instagramId;
        this.id = id;

        this.redisClient = useRedis();
        this.prismaClient = usePrisma();
    }

    public async syncInstagram(): Promise<boolean> {
        const instagramAccount = await this.prismaClient.instagram_accounts.findUnique({
            where: {id: this.instagramId}
        });

        if(!instagramAccount) return;

        const accessToken = decrypt(instagramAccount.token);

        const profile: APIResponse<InstagramProfile> = await InstagramConnector.accounts().getProfile(this.id, accessToken, true);
        if(!profile.success) return;
        const contentRequest: APIResponse<Post[]> = await InstagramConnector.content().getContentList(this.id, profile.data, 365, accessToken, true);
    }
}