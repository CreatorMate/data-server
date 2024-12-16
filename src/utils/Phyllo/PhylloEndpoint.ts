import env from "../../env";
import {REQUEST_TOO_LONG, TOO_MANY_REQUESTS} from "../../http-status-codes";

type methods =  'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';
export abstract class PhylloEndpoint {
    protected baseUrl: string = 'https://api.staging.getphyllo.com/v1'


    protected async fetch(method: methods, endpoint: string) {
        while (true) {
            const request = await fetch(this.baseUrl+endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + env?.API_KEY,
                }
            });

            if(request.status === TOO_MANY_REQUESTS) {
                const retryAfter = request.headers.get("Retry-After");
                if(retryAfter) {
                    const waitTime = parseInt(retryAfter, 10) * 1000;
                    console.warn(`Rate limited. Retrying ${retryAfter} seconds...`);
                    await this.wait(waitTime);
                    continue;
                }
            }

            const result = await request.json();
            if(!request.ok) {
                return {
                    success: false,
                    error: result.message,
                }
            }

            return {
                success: true,
                data: result,
            }
        }
    }

    private wait(seconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, seconds));
    }
}