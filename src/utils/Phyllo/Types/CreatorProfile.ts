export type CreatorProfile = {
    username: string,
    bio: string,
    followers: number,
    following: number,
    posts: number,
    profile_picture_url: number,
    website: number,
    id: string
}

export function toCreatorProfile(data: any, id: string): CreatorProfile {
    return {
        username: data.username,
        bio: data.bio,
        picture: data.image_url,
        followers: data.reputation.follower_count,
        following: data.reputation.following_count,
        website: data.website,
        posts: data.media_count,
        profile_picture_url: data.profile_picture_url,
        id: id
    }
}