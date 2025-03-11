import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {APIResponse, errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import env from "../../../src/env";
import {InstagramConnector} from "../../../src/utils/InstagramConnector/InstagramConnector";
import {encrypt} from "../../../src/utils/Encryption/Encryptor";

export class LinkCreatorInstagramEndpoint extends Endpoint {
    protected readonly description: string = "link an instagram account for a brand."
    protected readonly group: Groups = Groups.Creators;
    protected readonly method: string = "post";
    protected readonly route: string = '/creators/:id/instagram';
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const id = context.req.param('id');
        const {code} = await context.req.json();

        if(!code || !id) return errorResponse(context, 'INVALID_REQUEST');
        const creator = await this.getPrisma().creators.findFirst({
            where: {id: id}
        });

        if(!creator) return errorResponse(context, 'CREATOR_NOT_FOUND');

        const shortAccessToken = await InstagramConnector.accounts().getShortLivedAccessToken(code);
        if(!shortAccessToken.success) return errorResponse(context, shortAccessToken.error);

        const longLivedAccessToken: APIResponse<{access_token: string, expires_in: string}> = await InstagramConnector.accounts().getLongLivedAccessToken(shortAccessToken.data);
        if(!longLivedAccessToken.success) return errorResponse(context, longLivedAccessToken.error);

        const profileRequest: APIResponse = await InstagramConnector.accounts().getProfile(creator.id, longLivedAccessToken.data.access_token, true);
        if(!profileRequest.success) return errorResponse(context, profileRequest.error);

        let expirationTimestamp = Date.now() + Number(longLivedAccessToken.data.expires_in) * 1000;

        const expiresIn = new Date(expirationTimestamp).toISOString();
        const accessToken = encrypt(longLivedAccessToken.data.access_token);

        const instagramProfile = await this.getPrisma().instagram_accounts.create({
            data: {
                token: accessToken,
                expires_at: expiresIn,
                instagram_id: profileRequest.data.id
            }
        })

        if(!instagramProfile) return errorResponse(context, 'COULD_NOT_LINK');

        await this.getPrisma().creators.update({
            where: {id: creator.id},
            data: {
                instagram_id: instagramProfile.id
            }
        });


        return successResponse(context, longLivedAccessToken.data);
    }
}