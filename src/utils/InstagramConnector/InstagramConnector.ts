// import {Identity} from "./Endpoints/Identity";
// import {Engagement} from "./Endpoints/Engagement";
import {Content} from "./Endpoints/Content";
import {Accounts} from "./Endpoints/Accounts";
import {Engagement} from "./Endpoints/Engagement";

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
}