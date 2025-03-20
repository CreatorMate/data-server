export type Country = {
    code: string,
    value: number
}
export type City = {
    name: string,
    value: number
}
export type gender_age_distribution = {
    gender: 'MALE' | 'FEMALE' | 'OTHER',
    age_range: "13-17" | "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65-"
    value: number
}
export type Demographics = {
    countries: Country[]
    cities: City[]
    gender_age_distribution: gender_age_distribution[]
}

export type KeyValue = {
    key: string,
    value: number
}

export function toDemographics(data: any): Demographics {
    return {
        cities: data.cities,
        countries: data.countries,
        gender_age_distribution: data.gender_age_distribution
    }
}