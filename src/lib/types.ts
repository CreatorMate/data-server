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