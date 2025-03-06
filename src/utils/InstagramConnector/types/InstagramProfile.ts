export type InstagramProfile = {
    username: string,
    bio: string,
    followers: number,
    following: number,
    posts: number,
    profile_picture_url: string,
    website: string,
    id: string
}

export function toInstagramProfile(data: any): InstagramProfile {
    return {
        username: data.username,
        bio: data.biography,
        followers: data.followers_count,
        following: data.follows_count,
        website: data.website,
        posts: data.media_count,
        profile_picture_url: data.profile_picture_url,
        id: data.user_id
    }
}