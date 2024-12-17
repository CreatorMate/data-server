import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";

export class GetCreatorsContentItemsEndpoint extends Endpoint {
    protected readonly method: string = 'get';
    protected readonly route: string = '/';
    protected readonly group: Groups = Groups.Profiles;
    protected readonly description: string = 'Get the profile(s) demographics';
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const hoi = hoi;
    }
}