import {PrismaClient} from "@prisma/client";
import CreatorManager from "./CreatorManager";
import {RedisClient, useRedis} from "../lib/redis";
import {CreatorProfile} from "../utils/Phyllo/Types/CreatorProfile";
import {Post} from "../utils/Phyllo/Types/Post";
import {Country} from "../utils/Phyllo/Types/Demographics";

export default class BrandManager {
    brandId: number;
    prismaClient: PrismaClient;
    redis: RedisClient;

    constructor(brandId: number, prismaClient: PrismaClient) {
        this.brandId = brandId;
        this.prismaClient = prismaClient;

        this.redis = useRedis();
    }

    public async syncBrand() {
        const brandContentMap = {};
        const brandCountries = {};
        const brandCities = {};
        const brandAgeAndGender = {};
        const brandProfilesList: CreatorProfile[] = [];
        const creators = await this.getActiveCreators();

        for (const creator of creators) {
            const creatorManager = new CreatorManager(creator.id, this.prismaClient);
            const creatorData = await creatorManager.syncCreator();

            brandProfilesList.push(creatorData.profile);
            brandContentMap[creator.id] = creatorData.posts;
            brandCountries[creator.id] = creatorData.demographics.countries;
            brandCities[creator.id] = creatorData.demographics.cities;
            brandAgeAndGender[creator.id] = creatorData.demographics.gender_age_distribution;
        }

        await this.redis.storeInCache(`brands.${this.brandId}.content`, brandContentMap);
        await this.redis.storeInCache(`brands.${this.brandId}.profiles`, brandProfilesList);
        await this.redis.storeInCache(`brands.${this.brandId}.countries`, brandCountries);
        await this.redis.storeInCache(`brands.${this.brandId}.cities`, brandCities);
        await this.redis.storeInCache(`brands.${this.brandId}.gender_age_distribution`, brandAgeAndGender);

        this.prepareAnalytics().catch(err => console.error('Background task error:', err));
    }

    public async getAverageCountryDistribution(ids: string) {
        const brandPosts: Record<string, Country[]> = await this.redis.getFromCache(`brands.${this.brandId}.countries`);
        let creatorContent: Map<string, Country[]> = new Map(Object.entries(brandPosts));
        const {items: countries, size} =  this.filterCreatorsFromMap<Country>(creatorContent, ids);

        const countrySums = {};
        const countryCounts = {};

        countries.forEach(({ code, value }) => {
            if (!countrySums[code]) {
                countrySums[code] = 0;
                countryCounts[code] = 0;
            }
            countrySums[code] += value;
            countryCounts[code]++;
        });

        const averages = {};
        for (const code in countrySums) {
            // Include 0 for accounts where the country is missing
            averages[code] = parseFloat((countrySums[code] / size).toFixed(2));
        }

        return averages;
    }

    public async getSortedPosts(ids: string) {
        const brandPosts: Record<string, Post[]> = await this.redis.getFromCache(`brands.${this.brandId}.content`);
        let creatorContent: Map<string, Post[]> = new Map(Object.entries(brandPosts));
        return this.filterCreatorsFromMap<Post>(creatorContent, ids);
    }

    private async prepareAnalytics() {

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
            console.log(content);
            contentList.push(...content);
        }

        return {items: contentList, size: size};
    }

    public async getActiveCreators() {
        return this.prismaClient.creators.findMany({
            where: {
                brand_id: this.brandId,
                status: {
                    not: 'pending'
                }
            }
        });
    }
}