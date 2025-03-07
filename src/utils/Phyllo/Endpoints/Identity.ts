import {PhylloEndpoint} from "../PhylloEndpoint";
import {APIResponse, successResponse} from "../../APIResponse/HttpResponse";
import {toDemographics} from "../Types/Demographics";
import {toCreatorProfile} from "../Types/CreatorProfile";

export class Identity extends PhylloEndpoint {
    // public async getByAccountId(account_id: string): Promise<APIResponse> {
    //     const result = await this.fetch('GET', `/profiles?account_id=${account_id}`);
    //     if(!result.success) return result;
    //     result.data = toCreatorProfile(result.data.data[0]);
    //     return result;
    // }
    //
    // public async refreshAccountById(account_id: string): Promise<APIResponse> {
    //     return await this.fetch('POST', '/profiles/refresh', {
    //         account_id: account_id
    //     })
    // }
    //
    // public async getDemographicsByAccountId(account_id: string): Promise<APIResponse> {
    //     const result = await this.fetch('GET', `/audience?account_id=${account_id}`);
    //     if(!result.success) return result;
    //     result.data = toDemographics(result.data);
    //     return result;
    // }
}