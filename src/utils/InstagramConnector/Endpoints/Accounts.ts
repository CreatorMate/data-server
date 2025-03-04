import {APIResponse, errorResponse} from "../../APIResponse/HttpResponse";
import {usePrisma} from "../../../lib/prisma";
import {InstagramEndpoint} from "../InstagramEndpoint";
import env from "../../../env";
import {useRedis} from "../../../lib/redis";

export class Accounts extends InstagramEndpoint {

    private metaRedirectUrl = env?.META_REDIRECT_URL ?? '';
    private metaClientId = env?.META_CLIENT_ID ?? '';
    private metaClientSecret = env?.META_CLIENT_SECRET ?? '';

    public async getBrandProfile(access_token, brand_id) {
        const response = await this.ask(`/me?fields=user_id,username,biography,followers_count,follows_count,media_count,profile_picture_url,website&access_token=${access_token}`);

        if(response.success) {
            const redis = useRedis();
            await redis.storeInCache(`brands.${brand_id}.profile`, response.data);
        }

        return response;
    }

    public async getLongLivedAccessToken(access_token: string): Promise<APIResponse> {
        try {
            const longLivedResponse = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${this.metaClientSecret}&access_token=${access_token}`);

            if(!longLivedResponse.ok) {
                return {success: false, error: 'INVALID_CODE'};
            }

            const json = await longLivedResponse.json();
            return {success: true, data: json, meta: null}
        } catch (e) {
            return {success: false, error: 'INSTAGRAM_SERVER_ERROR'};
        }
    }

    public async getShortLivedAccessToken(code: string): Promise<APIResponse> {
        try {
            const data = new URLSearchParams();
            data.append("client_id", this.metaClientId);
            data.append("client_secret", this.metaClientSecret);
            data.append("grant_type", "authorization_code");
            data.append("redirect_uri", this.metaRedirectUrl);
            data.append("code", code);

            const result = await fetch('https://api.instagram.com/oauth/access_token', {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: data.toString()
            });

            if(!result.ok) {
                return {success: false, error: 'INVALID_CODE'};
            }

            const json = await result.json();
            return {success: true, data: json.access_token, meta: null}
        } catch (e) {
            return {success: false, error: 'INSTAGRAM_SERVER_ERROR'};
        }
    }
}