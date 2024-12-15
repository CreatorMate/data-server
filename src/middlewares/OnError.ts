import {Context, ErrorHandler} from "hono";
import {HTTPResponseError} from "hono/dist/types/types";
import {INTERNAL_SERVER_ERROR, OK} from "../http-status-codes";
import {StatusCode} from "hono/dist/types/utils/http-status";

const onError: ErrorHandler = (err: HTTPResponseError | Error, c: Context) => {
    const currentStatus = "status" in err ? err.status : c.newResponse(null).status;

    const statusCode = currentStatus !== OK ? (currentStatus as StatusCode) : INTERNAL_SERVER_ERROR;
    const env = c.env?.NODE_ENV || process.env?.NODE_ENV;
    return c.json({
            success: false,
            error: err.message,
            stack: env === "production" ? undefined : err.stack,
        },
        statusCode
    );
};

export default onError;