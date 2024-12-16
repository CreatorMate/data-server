import {Identity} from "./Endpoints/Identity";
import {Engagement} from "./Endpoints/Engagement";
import {Content} from "./Endpoints/Content";
import {Accounts} from "./Endpoints/Accounts";

export class PhylloClient {

    public profiles() {
        return new Identity();
    }

    public engagement() {
        return new Engagement();
    }

    public content() {
        return new Content();
    }

    public accounts() {
        return new Accounts();
    }
}