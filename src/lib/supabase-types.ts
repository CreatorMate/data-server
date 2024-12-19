export type Creator = {
    id: string,
    status: string,
    email: string,
    type: string,
    accepted: string,
    brand_id: number,
    country: string,
    username: string
}

export type ConnectedAccount = {
    id: number,
    account_id: string,
    user_id: string,
    platform_id: string
}