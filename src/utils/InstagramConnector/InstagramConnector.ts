// import {Identity} from "./Endpoints/Identity";
// import {Engagement} from "./Endpoints/Engagement";
import {Content} from "./Endpoints/Content";
import {Accounts} from "./Endpoints/Accounts";
import {Engagement} from "./Endpoints/Engagement";
import {Statistics} from "./Endpoints/Statistics";
import {Utilities} from "./Endpoints/Utilities";

export class InstagramConnector {

    // public profiles() {
    //     return new Identity();
    // }
    //
    public static engagement() {
        return new Engagement();
    }

    public static content() {
        return new Content();
    }

    public static accounts() {
        return new Accounts();
    }

    public static statistics() {
        return new Statistics();
    }

    public static utilities() {
        return new Utilities();
    }
}