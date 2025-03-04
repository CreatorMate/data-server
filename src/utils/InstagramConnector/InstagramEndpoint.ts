import env from "../../env";
import {REQUEST_TOO_LONG, TOO_MANY_REQUESTS} from "../../http-status-codes";
import {APIResponse, successResponse} from "../APIResponse/HttpResponse";

type methods =  'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';
export abstract class InstagramEndpoint {
    protected baseUrl: string = 'https://graph.instagram.com/v22.0'
    protected async ask<T>(path: string, method: 'GET'|'POST'|'PUT'|'DELETE' = 'GET', data: object = {}): Promise<APIResponse<T>>  {
        try {
            const requestObject: RequestInit = {}
            requestObject.method = method;
            if(method !== 'GET') {
                requestObject.body = JSON.stringify(data);
            }
            requestObject.headers = {
                'Accepts': 'application/json',
                'Content-Type': 'application/json'
            }

            const request = await fetch(`${this.baseUrl}${path}`, requestObject);

            const response = await request.json();

            if(!request.ok) {
                return {success: false, error: response.error}
            }

            return {success: true, data: response, meta: null};

        } catch (error) {
            return {success: false, error: 'INSTAGRAM_SERVER_ERROR'}
        }
    }
}