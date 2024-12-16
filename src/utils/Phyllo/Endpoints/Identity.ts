import {PhylloEndpoint} from "../PhylloEndpoint";
import {APIResponse} from "../../APIResponse/HttpResponse";

export class Identity extends PhylloEndpoint {
    public async getByAccountId(account_id: string): Promise<APIResponse> {
        return await this.fetch('GET', `/profiles?account_id=${account_id}`);
    }
}