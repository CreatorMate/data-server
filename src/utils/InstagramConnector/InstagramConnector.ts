// import {Identity} from "./Endpoints/Identity";
// import {Engagement} from "./Endpoints/Engagement";
import {Content} from "./Endpoints/Content";
import {Accounts} from "./Endpoints/Accounts";

export class InstagramConnector {

    // public profiles() {
    //     return new Identity();
    // }
    //
    // public engagement() {
    //     return new Engagement();
    // }

    public static content() {
        return new Content();
    }

    public static accounts() {
        return new Accounts();
    }
}