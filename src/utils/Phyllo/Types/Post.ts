import {CreatorProfile} from "./CreatorProfile";

export type Post = {
    id: string,
    updated_at: string,
    title: string,
    format: string,
    type: string,
    post_url: string,
    media_url: string,
    description: string,
    visibility: string,
    thumbnail: string | null,
    persistent_thumbnail: string,
    published_at: string,
    mentions: string[] | null
    likes: number,
    comments: number,
    reach: number,
    impressions: number,
    saves: number,
    views: number | null,
    replays: number | null,
    shares: number,
    additional_info: { profile_visits: number, bio_link_clicked: number | null, followers_gained: number } | null,
    engagement: number
}

export function toPost(data: any): Post {
    const post = {
        id: data.id,
        updated_at: data.updated_at,
        title: data.title,
        format: data.format,
        type: data.type,
        post_url: data.url,
        media_url: data.media_url,
        description: data.description,
        visibility: data.visibility,
        thumbnail: data.thumbnail_url ?? null,
        persistent_thumbnail: data.persistent_thumbnail_url,
        published_at: data.published_at,
        mentions: data.mentions ?? null,
        likes: data.engagement.like_count,
        comments: data.engagement.comment_count,
        reach: data.engagement.reach_organic_count,
        impressions: data.engagement.impression_organic_count,
        saves: data.engagement.save_count,
        views: data.engagement.view_count ?? null,
        replays: data.engagement.replay_count ?? null,
        shares: data.engagement.share_count,
        additional_info: data.engagement.additional_info,
        engagement: 0,
    }

    let interactions = post.likes + post.comments + post.shares + post.saves;
    let engagement = (interactions / post.reach) * 100;
    post.engagement = parseFloat((engagement).toFixed(2));

    return post;
}