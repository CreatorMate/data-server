import {KeyValue} from "../../Phyllo/Types/Demographics";

export class Utilities {
    public filterCreatorsFromMap<T>(contentMap: Map<string, T[]>, ids: string) {
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

    public filterDaysFromList<T>(key: keyof T, items: T[], days: number) {
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

    public getFieldTotal<T>(list: T[], key: keyof T): number {
        let value = 0;
        for(const item of list) {
            const fieldValue = item[key] as number;
            value += fieldValue;
        }
        return value;
    }

    public getAverageArrayValue<T>(list: T[], sumField: keyof T, valueField: keyof T, size: number): KeyValue[] {
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
}