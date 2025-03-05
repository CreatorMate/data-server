import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {APIResponse, errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import env from "../../../src/env";
import {InstagramConnector} from "../../../src/utils/InstagramConnector/InstagramConnector";
import {InstagramEndpoint} from "../../../src/utils/InstagramConnector/InstagramEndpoint";
import {decrypt} from "../../../src/utils/Encryption/Encryptor";

export class GetBrandProfileEndpoint extends Endpoint {
    protected readonly description: string = "get the instagram profile for a brand."
    protected readonly group: Groups = Groups.Brands;
    protected readonly method: string = "get";
    protected readonly route: string = '/brands/:id/instagram';
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const id = context.req.param('id');

        if(!id) return errorResponse(context, 'INVALID_REQUEST');

        const brand = await this.getPrisma().brands.findFirst({
            where: {id: Number(id)},
            include: {
                instagram_accounts: true
            }
        });

        if(!brand || !brand.instagram_accounts) return errorResponse(context, 'BRAND_NOT_FOUND');

        const brandCache = await this.getRedis().getFromCache(`${id}.profile`);

        if(brandCache) {
           return successResponse(context, brandCache)
        }

        const accessToken = decrypt(brand.instagram_accounts.token);

        const brandProfile = await InstagramConnector.accounts().getProfile(accessToken, brand.id);
        if(!brandProfile.success) return errorResponse(context, brandProfile.error);

        return successResponse(context, brandProfile.data);
    }
}