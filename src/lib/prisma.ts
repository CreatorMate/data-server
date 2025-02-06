import Redis from "ioredis";
import env from "../env";
import {PrismaClient} from "@prisma/client";

export class PrismaClientHandler {
    private static instance: PrismaClientHandler;
    public client: PrismaClient;

    private constructor() {
        this.client = new PrismaClient()
    }

    public static getInstance(): PrismaClientHandler {
        if (!PrismaClientHandler.instance) {
            PrismaClientHandler.instance = new PrismaClientHandler();
        }
        return PrismaClientHandler.instance;
    }
}

export function usePrisma(): PrismaClient {
    return PrismaClientHandler.getInstance().client;
}