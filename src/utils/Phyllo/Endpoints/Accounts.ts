import {PhylloEndpoint} from "../PhylloEndpoint";
import {APIResponse, errorResponse} from "../../APIResponse/HttpResponse";
import {PrismaClient} from "@prisma/client";
import {usePrisma} from "../../../lib/prisma";

export class Accounts extends PhylloEndpoint {
    // public async getAccountById(id: string): Promise<APIResponse> {
    //     try {
    //         const prismaClient = usePrisma();
    //         const creator = await prismaClient.creators.findFirst({
    //             //@ts-ignore
    //             where: {id: id}
    //         });
    //
    //         if(!creator) return {success: false, error: 'no creator with this id'};
    //
    //         const phylloConnection = await prismaClient.phyllo_connections.findFirst({
    //             where: {id: creator.id}
    //         });
    //
    //         if(!phylloConnection) return {success: false, error: 'this creator has not coupled an instagram account'};
    //
    //         //@ts-ignore
    //         const connectedAccount = await prismaClient.connected_accounts.findFirst({
    //             where: {user_id: phylloConnection.user_id}
    //         });
    //
    //         if(!connectedAccount) return {success: false, error: 'this creator has not coupled an instagram account'};
    //
    //         return {success: true, data: connectedAccount, meta: null}
    //     } catch (e) {
    //         return {success: false, error: 'provide a valid user id'};
    //     }
    // }
}