import {Identity} from "./Endpoints/Identity";
import {Engagement} from "./Endpoints/Engagement";
import {Content} from "./Endpoints/Content";

export class PhylloClient {

    public identity() {
        return new Identity();
    }

    public engagement() {
        return new Engagement();
    }

    public content() {
        return new Content();
    }
}