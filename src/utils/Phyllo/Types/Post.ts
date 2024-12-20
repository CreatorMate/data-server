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
    published_at: string,
    mentions: string[] | null
    likes: number,
    comments: number,
    reach_organic_count: number,
    saves: number,
    views: number | null,
    replays: number | null,
    shares: number
}

export function toPost(data: any): Post {
    return {
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
        published_at: data.published_at,
        mentions: data.mentions ?? null,
        likes: data.engagement.like_count,
        comments: data.engagement.comment_count,
        reach_organic_count: data.reach_organic_count,
        saves: data.engagement.save_count,
        views: data.engagement.view_count ?? null,
        replays: data.engagement.replay_count ?? null,
        shares: data.engagement.share_count
    }
}