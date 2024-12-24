import {Context, NotFoundHandler} from "hono";
import {NOT_FOUND} from "../http-status-codes";

const notFound: NotFoundHandler = (c: Context) => {
    c.status(404);
    return c.json({
        success: false,
        message: `${NOT_FOUND} - ${c.req.path}`
    }, NOT_FOUND);
};

export default notFound;