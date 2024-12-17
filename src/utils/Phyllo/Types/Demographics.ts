type Country = {
    code: string,
    value: number
}
type City = {
    name: string,
    value: number
}
type gender_age_distribution = {
    gender: 'MALE' | 'FEMALE' | 'OTHER',
    age_range: "13-17" | "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65-"
    value: number
}
export type Demographics = {
    countries: Country[]
    cities: City[]
    gender_age_distribution: gender_age_distribution[]
}

export function toDemographics(data: any): Demographics {
    return {
        cities: data.cities,
        countries: data.cities,
        gender_age_distribution: data.gender_age_distribution
    }
}