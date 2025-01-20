import {PhylloEndpoint} from "../PhylloEndpoint";
import {APIResponse} from "../../APIResponse/HttpResponse";
import {Post, toPost} from "../Types/Post";
import {formatDate} from "../../../lib/utils";
import {CreatorProfile} from "../Types/CreatorProfile";

export class Content extends PhylloEndpoint {
    public async getContentList(account_id: string, profile: CreatorProfile, days = 30): Promise<APIResponse> {
        const currentDate = new Date();
        let pastDate = new Date(currentDate);

        pastDate.setDate(currentDate.getDate() - days);

        const contentRequest: APIResponse<any> = await this.fetch('GET', `/social/contents?account_id=${account_id}&to_date=${formatDate(currentDate)}&from_date=${formatDate(pastDate)}&limit=100`);

        if (!contentRequest.success) return contentRequest;

        const posts: Post[] = [];
        for (const post of contentRequest.data.data) {
            posts.push(toPost(post, profile));
        }
        contentRequest.data = posts;

        return contentRequest;
    }

    // public async getContentById(content_id: string): Promise<APIResponse> {
    //     const contentRequest = await this.fetch('GET', `/social/contents/${content_id}`);
    //     if (!contentRequest.success) return contentRequest;
    //     contentRequest.data = toPost(contentRequest.data);
    //     return contentRequest;
    // }

    // public async getContentByIds(ids: string[]) {
    //     const contentRequest = await this.fetch('POST', `/social/contents/search`, {
    //         ids: ids
    //     });
    //     if (!contentRequest.success) return contentRequest;
    //     const posts: Post[] = [];
    //     for (const post of contentRequest.data.data) {
    //         posts.push(toPost(post));
    //     }
    //     contentRequest.data = posts;
    //     return contentRequest;
    // }

    public async refreshContentFor(account_id: string): Promise<APIResponse> {
        return await this.fetch('POST', '/social/contents/refresh', {
            account_id: account_id
        })
    }


    public async getCommentsByAccountId(account_id: string, content_id: string): Promise<APIResponse> {
        return await this.fetch('GET', `/social/comments?account_id=${account_id}&content_id=${content_id}`);
    }
}