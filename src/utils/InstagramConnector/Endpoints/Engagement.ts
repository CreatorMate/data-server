import {InstagramEndpoint} from "../InstagramEndpoint";
import {APIResponse} from "../../APIResponse/HttpResponse";
import {number, string} from "zod";
import {useRedis} from "../../../lib/redis";

export class Engagement extends InstagramEndpoint {
    private redis = useRedis();
    public async getAudienceCities(id: string, accountId: string, accessToken: string = '', refresh = false): Promise<APIResponse> {
        if(!refresh) {
            const data = await this.redis.getFromCache(`${id}.audience_cities`)
            return {success: true, data: data ?? [], meta: null}
        }

        const request = await this.getDemographics(accountId, accessToken, 'engaged_audience_demographics', 'city');
        await this.redis.storeInCache(`${id}.audience_cities`, request);
        return {success: true, data: request, meta: null}
    }

    public async getAudienceCountries(id: string, accountId: string, accessToken: string = '', refresh = false): Promise<APIResponse> {
        if(!refresh) {
            const data = await this.redis.getFromCache(`${id}.audience_countries`)
            return {success: true, data: data ?? [], meta: null}
        }

        const request = await this.getDemographics(accountId, accessToken, 'engaged_audience_demographics', 'country');
        await this.redis.storeInCache(`${id}.audience_countries`, request);
        return {success: true, data: request, meta: null}
    }

    public async getAudienceGenders(id: string, accountId: string, accessToken: string = '', refresh = false): Promise<APIResponse> {
        if(!refresh) {
            const data = await this.redis.getFromCache(`${id}.audience_genders`)
            return {success: true, data: data ?? [], meta: null}
        }

        const request = await this.getDemographics(accountId, accessToken, 'engaged_audience_demographics', 'gender');
        await this.redis.storeInCache(`${id}.audience_genders`, request);
        return {success: true, data: request, meta: null}
    }

    public async getAudienceAge(id: string, accountId: string, accessToken: string = '', refresh = false): Promise<APIResponse> {
        if(!refresh) {
            const data = await this.redis.getFromCache(`${id}.audience_ages`)
            return {success: true, data: data ?? [], meta: null}
        }

        const request = await this.getDemographics(accountId, accessToken, 'engaged_audience_demographics', 'age');
        await this.redis.storeInCache(`${id}.audience_ages`, request);
        return {success: true, data: request, meta: null}
    }

    public async getFollowerCities(id: string, accountId: string = '', accessToken: string = '', refresh = false): Promise<APIResponse> {
        if(!refresh) {
            const data = await this.redis.getFromCache(`${id}.follower_cities`)
            return {success: true, data: data ?? [], meta: null}
        }

        const request = await this.getDemographics(accountId, accessToken, 'follower_demographics', 'city');
        await this.redis.storeInCache(`${id}.follower_cities`, request);
        return {success: true, data: request, meta: null}
    }

    public async getFollowerCountries(id: string, accountId: string = '', accessToken: string = '', refresh = false): Promise<APIResponse> {
        if(!refresh) {
            const data = await this.redis.getFromCache(`${id}.follower_countries`)
            return {success: true, data: data ?? [], meta: null}
        }

        const request = await this.getDemographics(accountId, accessToken, 'follower_demographics', 'country');
        await this.redis.storeInCache(`${id}.follower_countries`, request);
        return {success: true, data: request, meta: null}
    }

    public async getFollowerGenders(id: string, accountId: string = '', accessToken: string = '', refresh = false): Promise<APIResponse> {
        if(!refresh) {
            const data = await this.redis.getFromCache(`${id}.follower_genders`)
            return {success: true, data: data ?? [], meta: null}
        }

        const request = await this.getDemographics(accountId, accessToken, 'follower_demographics', 'gender');
        await this.redis.storeInCache(`${id}.follower_genders`, request);
        return {success: true, data: request, meta: null}
    }

    public async getFollowerAge(id: string, accountId: string = '', accessToken: string = '', refresh = false): Promise<APIResponse> {
        if(!refresh) {
            const data = await this.redis.getFromCache(`${id}.follower_ages`)
            return {success: true, data: data ?? [], meta: null}
        }

        const request = await this.getDemographics(accountId, accessToken, 'follower_demographics', 'age');
        await this.redis.storeInCache(`${id}.follower_ages`, request);
        return {success: true, data: request, meta: null}
    }

    public async getUserInsights(id: string, accountId: string = '', accessToken: string = '', refresh: boolean = false): Promise<APIResponse> {
        if(!refresh) {
            const data = await this.redis.getFromCache(`${id}.insights`)
            return {success: true, data: data ?? {}, meta: null}
        }
        const since = Math.floor((new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).getTime() / 1000);
        const until = Math.floor(Date.now() / 1000);

        console.log(`/${accountId}/insights?metric=reach,views,follows_and_unfollows&period=day&breakdown=follow_type&metric_type=total_value&since=${since}&until=${until}`)

        const request: APIResponse<DemographicsResponse> = await this.ask(`/${accountId}/insights?metric=reach,views,follows_and_unfollows&period=day&breakdown=follow_type&metric_type=total_value&since=${since}&until=${until}&access_token=${accessToken}`);
        if(!request.success) return {success: false, error: 'invalid_request'};

        if(request.data.data.length === 0) {
            await this.redis.storeInCache(`${id}.insights`, []);
            return {success: true, data: [], meta: null};
        }

        const data = request.data.data.map((demographic) => {
            return {
                key: demographic.name,
                total: demographic.total_value.value ?? 0,
                from_followers: demographic.total_value.breakdowns[0].results[0].value,
                from_non_followers: demographic.total_value.breakdowns[0].results[1].value,
            }
        });

        await this.redis.storeInCache(`${id}.insights`, data);
        return {success: true, data: data, meta: null};
    }

    private async getDemographics(id: string, accessToken: string, key: string, breakdown: string): Promise<{key: string, value: number}[]> {
        const request: APIResponse<DemographicsResponse> = await this.ask(`/${id}/insights?metric=${key}&period=lifetime&timeframe=last_90_days&breakdown=${breakdown}&metric_type=total_value&access_token=${accessToken}`);
        if(!request.success) return [];
        if(request.data.data.length === 0) {
            return []
        }
        if(!request.data.data[0].total_value.breakdowns[0].results) {
            return []
        }
        const data = request.data.data[0].total_value.breakdowns[0].results.map((breakdown) => {
            return {
                key: breakdown.dimension_values[0],
                value: breakdown.value
            }
        });

        return data
    }
}

type DemographicsResponse = {
    data: DemographicResponse[]
}

type DemographicResponse = {
    name: string,
    total_value: {
        value?: number
        breakdowns: Breakdown[]
    }
}

type Breakdown = {
    results: {
        dimension_values: string[],
        value: number
    }[]
}