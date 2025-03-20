import {APIResponse} from "../../APIResponse/HttpResponse";
import {formatDate} from "../../../lib/utils";
import {InstagramEndpoint} from "../InstagramEndpoint";
import {CreatorProfile} from "../../Phyllo/Types/CreatorProfile";
import {Post, toPost} from "../../Phyllo/Types/Post";
import {InstagramProfile} from "../types/InstagramProfile";
import {useRedis} from "../../../lib/redis";
import {InstagramComment, InstagramPost} from "../types/InstagramPostTypes";
import {usePrisma} from "../../../lib/prisma";
import {decrypt} from "../../Encryption/Encryptor";
import {InstagramConnector} from "../InstagramConnector";

export class Content extends InstagramEndpoint {
    private redis = useRedis();
    public async getContentList(id: string, profile: InstagramProfile|null = null, days = 365, access_token: string = '', refresh: boolean = false): Promise<APIResponse> {
        if(!refresh) {
            return {success: true, data: await this.redis.getFromCache(`${id}.content`) ?? [], meta: null,}
        }

        if(!profile) return {success: true, data: [], meta: null,}

        const request: APIResponse<{data: InstagramPost[]}> = await this.ask(`/${profile.id}/media?fields=media_type,timestamp,thumbnail_url,permalink,media_url,media_product_type,caption&access_token=${access_token}&limit=30`);

        if(!request.success) return request;

        const posts: InstagramPost[] = [];

        for(const post of request.data.data) {
            const postWithInsights = await this.getMediaInsights(post, access_token);
            if(!postWithInsights) continue;

            postWithInsights.posted_by = profile?.username ?? '';
            postWithInsights.user_picture = profile?.profile_picture_url ?? '';

            const finishedPost = this.calculateExtraInsights(postWithInsights, profile);
            finishedPost.posted_by_id = profile.id;
            posts.push(postWithInsights);
        }
        await this.redis.storeInCache(`${id}.content`, posts);
        return {success: true, data: posts, meta: null}
    }

    public async getPosts(id, ids: string = '', amountOfDays: string = "") {
        let days = 90;
        if(amountOfDays) days = amountOfDays as number;

        const brandPosts: Record<string, InstagramPost[]> = await this.redis.getFromCache(`brands.${id}.content`);
        let creatorContent: Map<string, InstagramPost[]> = new Map(Object.entries(brandPosts));
        const {items: filteredPosts, size} = InstagramConnector.utilities().filterCreatorsFromMap<InstagramPost>(creatorContent, ids);
        const dateFilter = InstagramConnector.utilities().filterDaysFromList<InstagramPost>('timestamp', filteredPosts, days);

        return dateFilter;
    }

    public async getPostComments(postId: string, igId: string): Promise<InstagramComment[]> {
        console.log(postId, igId)
        const prisma = usePrisma();
        const instagramProfile = await prisma.instagram_accounts.findFirst({
            where: {
                instagram_id: igId
            }
        });
        //@todo add actual error handle
        if(!instagramProfile) return [];

        const access_token = decrypt(instagramProfile.token);

        const request: APIResponse<{data: InstagramComment[]}> = await this.ask(`/${postId}/comments?fields=text,like_count,username&access_token=${access_token}&limit=50`);

        if(!request.success) return [];

        return request.data.data;
    }

    private calculateExtraInsights(post: InstagramPost, profile: InstagramProfile): InstagramPost {
        if(post.media_product_type !== 'STORY') {
            const engagement = (post.total_interactions / post.reach) * 100;
            post.engagement = parseFloat((engagement).toFixed(2));

            let activeInteractions = post.comments + post.saved + post.shares;
            let activeEngagement = (activeInteractions / post.reach) * 100;
            post.active_engagement = parseFloat((activeEngagement).toFixed(2));

            let reachRate = (post.reach / profile.followers) * 100;
            post.reach_rate = parseFloat((reachRate).toFixed(2));
        }

        return post;
    }

    private async getMediaInsights(media: InstagramPost, accessToken: string) {
        const metrics = new Map<string, string>();
        metrics.set('FEED', 'comments,follows,likes,profile_activity,profile_visits,reach,saved,shares,total_interactions');
        metrics.set('REELS', 'comments,ig_reels_avg_watch_time,ig_reels_video_view_total_time,likes,reach,saved,shares,total_interactions');
        metrics.set('STORY', 'follows,navigation,profile_activity,profile_visits,reach,replies,shares,total_interactions');

        const request: APIResponse = await this.ask(`/${media.id}/insights?metric=${metrics.get(media.media_product_type)}&access_token=${accessToken}`);

        if(!request.success) {
            return null;
        }
        for(const metric of request.data.data) {
            //@ts-ignore
            media[metric.name] = metric.values[0].value;
        }
        return media;
    }

}