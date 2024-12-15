import {Hook} from "@hono/zod-openapi";
import {Context} from "hono";
import {UNPROCESSABLE_ENTITY} from "../../http-status-codes";

const defaultHook: Hook<any, any, any, any> = (result, c: Context) => {
    if (!result.success) {
        return c.json({
                success: result.success,
                error: result.error
            },
            UNPROCESSABLE_ENTITY
        )
    }
};

export default defaultHook;