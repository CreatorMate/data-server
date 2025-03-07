import {PrismaClient} from "@prisma/client";
import CreatorManager from "./CreatorManager";
import {RedisClient, useRedis} from "../lib/redis";
import {CreatorProfile} from "../utils/Phyllo/Types/CreatorProfile";
import {Post} from "../utils/Phyllo/Types/Post";
import {City, Country, gender_age_distribution} from "../utils/Phyllo/Types/Demographics";
import {InstagramConnector} from "../utils/InstagramConnector/InstagramConnector";
import {InstagramProfile} from "../utils/InstagramConnector/types/InstagramProfile";
import {InstagramPost} from "../utils/InstagramConnector/types/InstagramPostTypes";

export default class BrandManager {
    brandId: number;
    prismaClient: PrismaClient;
    redis: RedisClient;

    constructor(brandId: number, prismaClient: PrismaClient) {
        this.brandId = brandId;
        this.prismaClient = prismaClient;

        this.redis = useRedis();
    }

    public async syncBrand(idsStoSync: {id: string, instagramId: number}[]) {
        const brandContentMap: {[key: string]: InstagramPost[]} = {};
        const brandProfilesList: InstagramProfile[] = [];

        for (const id of idsStoSync) {
            const profile = await InstagramConnector.accounts().getProfile(id.id);
            const content = await InstagramConnector.content().getContentList(id.id);
            if(profile.success) brandProfilesList.push(profile.data);
            if(content.success) brandContentMap[id.id] = content.data;
        }

        await this.redis.storeInCache(`brands.${this.brandId}.content`, brandContentMap);
        await this.redis.storeInCache(`brands.${this.brandId}.profiles`, brandProfilesList);

        this.prepareAnalytics().catch(err => console.error('Background task error:', err));
    }

    public async addPostsToBrand(creatorId: string, posts: any) {
        const brandPosts = await this.redis.getFromCache(`brands.${this.brandId}.content`);
        brandPosts[creatorId] = posts;

        await this.redis.storeInCache(`brands.${this.brandId}.content`, brandPosts);
    }

    public async addDemographicsToBrand(creatorId: string, demographics: any) {
        const brandAgeAndGender = await this.redis.getFromCache(`brands.${this.brandId}.gender_age_distribution`);
        const brandCities = await this.redis.getFromCache(`brands.${this.brandId}.cities`);
        const brandCountries = await this.redis.getFromCache(`brands.${this.brandId}.countries`);

        brandCountries[creatorId] = demographics.countries;
        brandCities[creatorId] = demographics.cities;
        brandAgeAndGender[creatorId] = demographics.gender_age_distribution;

        await this.redis.storeInCache(`brands.${this.brandId}.countries`, brandCountries);
        await this.redis.storeInCache(`brands.${this.brandId}.cities`, brandCities);
        await this.redis.storeInCache(`brands.${this.brandId}.gender_age_distribution`, brandAgeAndGender);
    }

    public async addProfilesToBrand(creatorId: string, profile: any) {
        const brandProfiles: CreatorProfile[] = await this.redis.getFromCache(`brands.${this.brandId}.profiles`);
        //@ts-ignore
        brandProfiles[creatorId] = profile;
        await this.redis.storeInCache(`brands.${this.brandId}.profiles`, brandProfiles);
    }

    private getAverageArrayValue<T>(list: T[], sumField: keyof T, valueField: keyof T, size: number): KeyValue[] {
        const sums: {[key: string]: number}  = {};
        const counts: {[key: string]: number}  = {};

        for(const item of list) {
            const type = item[sumField] as string;
            const value = item[valueField] as number;
            if (!sums[type]) {
                sums[type] = 0;
                counts[type] = 0;
            }
            sums[type] += value;
            counts[type]++;
        }

        const averages: KeyValue[] = [];

        for (const field in sums) {
            averages.push({
                key: field,
                value: parseFloat((sums[field] / size).toFixed(2))
            })
        }

        return averages
    }

    public async getGenderDistribution(ids: string) {
        const rawGenderInformation: Record<string, gender_age_distribution[]> = await this.redis.getFromCache(`brands.${this.brandId}.gender_age_distribution`);
        let genderInformation: Map<string, gender_age_distribution[]> = new Map(Object.entries(rawGenderInformation));

        console.log(genderInformation);

        const {items: filteredGenderInformation, size} =  this.filterCreatorsFromMap<gender_age_distribution>(genderInformation, ids);

        return this.getAverageArrayValue<gender_age_distribution>(filteredGenderInformation, 'gender', 'value', size);
    }

    public async getAgeDistribution(ids: string, days: string) {
        const rawAgeInformation: Record<string, gender_age_distribution[]> = await this.redis.getFromCache(`brands.${this.brandId}.gender_age_distribution`);
        let ageInformation: Map<string, gender_age_distribution[]> = new Map(Object.entries(rawAgeInformation));
        const {items: filteredAgeInformation, size} =  this.filterCreatorsFromMap<gender_age_distribution>(ageInformation, ids);

        return this.getAverageArrayValue<gender_age_distribution>(filteredAgeInformation, 'age_range', 'value', size);
    }

    public async getAgeGenderDistribution(ids: string) {
        const rawAgeInformation: Record<string, gender_age_distribution[]> = await this.redis.getFromCache(`brands.${this.brandId}.gender_age_distribution`);
        let ageInformation: Map<string, gender_age_distribution[]> = new Map(Object.entries(rawAgeInformation));
        const {items: filteredAgeInformation, size} =  this.filterCreatorsFromMap<gender_age_distribution>(ageInformation, ids);

        const ageSums: {[key: string]: number}  = {};
        const ageCounts: {[key: string]: number}  = {};

        filteredAgeInformation.forEach(({ age_range, gender,  value }) => {
            const type = `${gender} - ${age_range}`
            if (!ageSums[type]) {
                ageSums[type] = 0;
                ageCounts[type] = 0;
            }
            ageSums[type] += value;
            ageCounts[type]++;
        });

        const averages: {[key: string]: number}  = {};
        for (const age_range in ageSums) {
            averages[age_range] = parseFloat((ageSums[age_range] / size).toFixed(2));
        }

        return averages;
    }

    public async getAverageCountryDistribution(ids: string) {
        const countryCache: Record<string, Country[]> = await this.redis.getFromCache(`brands.${this.brandId}.countries`);
        let rawCountryStats: Map<string, Country[]> = new Map(Object.entries(countryCache));
        const {items: countries, size} =  this.filterCreatorsFromMap<Country>(rawCountryStats, ids);

        const countrySums: {[key: string]: number}  = {};
        const countryCounts: {[key: string]: number}  = {};

        countries.forEach(({ code, value }) => {
            if (!countrySums[code]) {
                countrySums[code] = 0;
                countryCounts[code] = 0;
            }
            countrySums[code] += value;
            countryCounts[code]++;
        });

        const averages: {[key: string]: number} = {};
        for (const code in countrySums) {
            // Include 0 for accounts where the country is missing
            averages[code] = parseFloat((countrySums[code] / size).toFixed(2));
        }

        return averages;
    }

    public async getAverageCityDistribution(ids: string) {
        const cityCache: Record<string, City[]> = await this.redis.getFromCache(`brands.${this.brandId}.cities`);
        let rawCityStats: Map<string, City[]> = new Map(Object.entries(cityCache));
        const {items: cities, size} =  this.filterCreatorsFromMap<City>(rawCityStats, ids);

        return this.getAverageArrayValue<City>(cities, 'name', 'value', size);
    }

    public async getPosts(ids: string, amountOfDays: unknown = "") {
        let days = 90;
        if(amountOfDays) days = amountOfDays as number;
        const brandPosts: Record<string, InstagramPost[]> = await this.redis.getFromCache(`brands.${this.brandId}.content`);
        for (const key in brandPosts) {
            if (!Array.isArray(brandPosts[key])) {
                brandPosts[key] = [];
            }
        }
        let creatorContent: Map<string, InstagramPost[]> = new Map(Object.entries(brandPosts));
        const {items: filteredPosts, size} = this.filterCreatorsFromMap<InstagramPost>(creatorContent, ids);
        const dateFilter = this.filterDaysFromList<InstagramPost>('timestamp', filteredPosts, days);

        return filteredPosts;
    }

    public async getFollowers(ids: string): Promise<number> {
        const brandProfiles: CreatorProfile[] = await this.redis.getFromCache(`brands.${this.brandId}.profiles`);
        let followers = 0;
        let creatorIds: string[] = [];
        if(ids) {
            creatorIds = ids.split(',');
        }
        for(const profile of brandProfiles) {
            if(creatorIds.length > 0 && !creatorIds.includes(profile.id ?? '?')) continue;
            followers += profile.followers;
        }

        return followers;
    }

    private async prepareAnalytics() {

    }

    private filterDaysFromList<T>(key: keyof T, items: T[], days: number) {
        const filteredItems: T[] = [];
        for (const item of items) {
            const fieldValue = item[key] as string;
            const currentDate = new Date();
            const checkDate = new Date();
            let publishedDate = new Date(fieldValue);
            checkDate.setDate(currentDate.getDate() - days)
            if(publishedDate < checkDate) continue;

            filteredItems.push(item);

        }
        return filteredItems;
    }

    public getAverageField<T>(list: T[], key: keyof T): number {
        let value = 0;
        for(const item of list) {
            const fieldValue = item[key] as number;
            value += fieldValue;
        }
        return parseFloat((value / list.length).toFixed(2));
    }

    private filterCreatorsFromMap<T>(contentMap: Map<string, T[]>, ids: string) {
        const contentList: T[] = [];
        let size = 0;
        let creatorIds: string[] = [];
        if(ids) {
            creatorIds = ids.split(',');
        }

        for (const [id, content] of contentMap.entries()) {
            if(creatorIds.length !== 0 && !creatorIds.includes(id)) continue;
            size++;
            contentList.push(...content);
        }

        return {items: contentList, size: size};
    }

    public async getActiveCreators() {
         return this.prismaClient.creators.findMany({
            where: {
                creator_brand: {
                    some: {
                        brand_id: this.brandId,
                        accepted: true,
                    },
                },
            },
            include: {
                creator_brand: true, // Optional: include relationship data
            },
        });
    }
}

type KeyValue = {
    key: string,
    value: number
}