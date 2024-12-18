import type {Context} from "hono";
import {StatusCode} from "hono/dist/types/utils/http-status";

export type APIResponse<T = any> = {
    success: true,
    data: T,
    meta: any
} | {
    success: false,
    error: string,
}

export function successResponse<T>(context: Context, data: any, meta: any = null) {
    context.status(200);
    return context.json({
        success: true,
        data: data,
        meta: meta
    });
}

export function errorResponse(context: Context, error: string, code = 500) {
    context.status(<StatusCode>code);
    return context.json({
        success: false,
        error: error
    })
}
