export type CreatorProfile = {
    username: string,
    platform_username: string,
    full_name: string,
    profile_url: string,
    description: string,
    picture: string,
    date_of_birth: string|null,
    platform_account_type: string|null,
    category: string|null,
    followers: number,
    following: number
    posts: number,
    gender: string|null,
    country: string|null,
    is_verified: boolean,
    website: string
}

export function toCreatorProfile(data: any): CreatorProfile {
    console.log(data);
    return {
        username: data.username,
        platform_username: data.platform_username,
        full_name: data.full_name,
        description: data.introduction,
        picture: data.image_url,
        followers: data.reputation.follower_count,
        following: data.reputation.following_count,
        website: data.websitem,
        category: data.category,
        country: data.country,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        is_verified: data.is_verified,
        platform_account_type: data.platform_account_type,
        posts: data.reputation.content_count,
        profile_url: data.url,
    }
}