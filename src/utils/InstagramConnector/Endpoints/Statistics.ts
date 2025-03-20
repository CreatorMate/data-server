import {InstagramPost} from "../types/InstagramPostTypes";
import {InstagramConnector} from "../InstagramConnector";
import {gender_age_distribution, KeyValue} from "../../Phyllo/Types/Demographics";
import {useRedis} from "../../../lib/redis";

export class Statistics {
    public async getAveragePostStatistic(id: string, key: keyof InstagramPost, ids: string, days: string) {
        const posts = await InstagramConnector.content().getPosts(id, ids, days);
        return InstagramConnector.utilities().getAverageField<InstagramPost>(posts, key as keyof InstagramPost);
    }

    public async getTotalPostStatistic(id: string, key: keyof InstagramPost, ids: string, days: string) {
        const posts = await InstagramConnector.content().getPosts(id, ids, days);
        return InstagramConnector.utilities().getFieldTotal<InstagramPost>(posts, key as keyof InstagramPost);
    }

    public async getAgeDistribution(id: string, ids: string, days: string) {
        const rawAgeInformation: Record<string, KeyValue[]> = await useRedis().getFromCache(`brands.${id}.audience_ages`);

        let ageInformation: Map<string, KeyValue[]> = new Map(Object.entries(rawAgeInformation));
        const {items: filteredAgeInformation, size} =  InstagramConnector.utilities().filterCreatorsFromMap<KeyValue>(ageInformation, ids);

        return InstagramConnector.utilities().getAverageArrayValue<KeyValue>(filteredAgeInformation, 'key', 'value', size);
    }
}