import {PrismaClient} from "@prisma/client";
import {RedisClient, useRedis} from "../../lib/redis";
import {usePrisma} from "../../lib/prisma";
import {decrypt, encrypt} from "../Encryption/Encryptor";
import {APIResponse} from "../APIResponse/HttpResponse";
import {Post} from "../Phyllo/Types/Post";
import {InstagramConnector} from "./InstagramConnector";
import {CreatorProfile} from "../Phyllo/Types/CreatorProfile";
import {InstagramProfile} from "./types/InstagramProfile";
import {isExpirationWithinDays} from "../utils";
import {InstagramEndpoint} from "./InstagramEndpoint";

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
        let instagramAccount = await this.prismaClient.instagram_accounts.findUnique({
            where: {id: this.instagramId}
        });

        if(!instagramAccount) return false;

        let accessToken = decrypt(instagramAccount.token);
        console.log(`${instagramAccount.id} - ${accessToken}`)

        if(isExpirationWithinDays(instagramAccount.expires_at.toString(), 50)) {
            const refresh = await this.refreshAccessToken(instagramAccount.id ,accessToken);

            if(!refresh.success) return false;

            instagramAccount = await this.prismaClient.instagram_accounts.findUnique({
                where: {id: this.instagramId}
            });

            if(!instagramAccount) return false;

            accessToken = refresh.data;
        }

        const profile: APIResponse<InstagramProfile> = await InstagramConnector.accounts().getProfile(this.id, accessToken, true);
        if(!profile.success) return false;

        //sync content
        const contentRequest: APIResponse<Post[]> = await InstagramConnector.content().getContentList(this.id, profile.data, 365, accessToken, true);

        //sync cities
        const cityAudience = await InstagramConnector.engagement().getAudienceCities(this.id, profile.data.id, accessToken, true);
        const cityFollowers = await InstagramConnector.engagement().getFollowerCities(this.id, profile.data.id, accessToken, true);

        //sync countries
        const countryAudience = await InstagramConnector.engagement().getAudienceCountries(this.id, profile.data.id, accessToken, true);
        const countryFollowers = await InstagramConnector.engagement().getFollowerCountries(this.id, profile.data.id, accessToken, true);

        //sync ages
        const ageAudience = await InstagramConnector.engagement().getAudienceAge(this.id, profile.data.id, accessToken, true);
        const ageFollowers = await InstagramConnector.engagement().getFollowerAge(this.id, profile.data.id, accessToken, true);

        //sync genders
        const genderAudience = await InstagramConnector.engagement().getAudienceGenders(this.id, profile.data.id, accessToken, true);
        const genderFollowers = await InstagramConnector.engagement().getFollowerGenders(this.id, profile.data.id, accessToken, true);

        //sync insights
        const insights = await InstagramConnector.engagement().getUserInsights(this.id, profile.data.id, accessToken, true);
        return true;
    }

    private async refreshAccessToken(id: any, accessToken: string): Promise<{success: boolean, data: string}>{
        const newLongLivedToken: APIResponse<{access_token: string, expires_in: string}> = await InstagramConnector.accounts().refreshAccessToken(accessToken);
        if(!newLongLivedToken.success) return {success: false, data: 'request_failed'};

        let expirationTimestamp = Date.now() + Number(newLongLivedToken.data.expires_in) * 1000;

        const expiresIn = new Date(expirationTimestamp).toISOString();
        const encryptedToken = encrypt(newLongLivedToken.data.access_token);

        const updated = await this.prismaClient.instagram_accounts.update({
            where: {id: id},
            data: {
                token: encryptedToken,
                expires_at: expiresIn
            }
        });

        if(!updated) return {success: false, data: 'saving_failed'};

        return {
            success: true,
            data: newLongLivedToken.data.access_token
        }
    }
}