export type InstagramPost = {
    caption: string,
    media_type: string,
    media_product_type: 'FEED'|'STORY'|'REELS',
    timestamp: string,
    thumbnail_url: string,
    permalink: string,
    media_url: string,
    comments: number,
    follows: number,
    likes: number,
    profile_activity: number,
    profile_visits: number,
    reach: number,
    saved: number,
    shares: number,
    total_interactions: number,
    views: number,
    ig_reels_avg_watch_time: number,
    ig_reels_video_view_total_time: number,
    navigation: number,
    replies: number,
    engagement: number,
    reach_rate: number,
    active_engagement: number,
    user_picture: string,
    posted_by: string,
    posted_by_id: string,
    id: number
}

export type InstagramComment = {
    text: string,
    like_count: number,
    id: string
}