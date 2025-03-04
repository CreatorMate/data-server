import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import env from "../../../src/env";
import {createAzure} from "@ai-sdk/azure";
import {generateText, streamText, tool} from "ai";
import {successResponse} from "../../../src/utils/APIResponse/HttpResponse";

export class AskEndpoint extends Endpoint {
    protected readonly description: string = "chat"
    protected readonly group: Groups = Groups.Brands;
    protected readonly method: string = "post";
    protected readonly route: string = '/ask';
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context): any {
        const {question} = await context.req.json();

        const key = env?.AZURE_AI_KEY ?? '';
        const azure = createAzure({
            resourceName: 'creatormate-ai',
            apiKey: key
        });
        const model = azure('gpt-4o-mini');

        const tools = {
            getLikes: tool({
                description: "Fetch the number of likes for a user within a given time period",
                parameters: z.object({
                    userId: z.string().describe("User ID to fetch likes for"),
                    days: z.number().describe("Number of past days to get likes from"),
                }),
                execute: async ({ userId, days }) => {
                    return this.getLikes(userId, days);
                },
            }),
            getProfile: tool({
                description: "Fetch the profile for a specific brand or user by its name",
                parameters: z.object({
                    name: z.string().describe("the name of the user"),
                }),
                execute: async ({ name }) => {
                    return this.getProfile(name);
                },
            }),
        };

        // Ask AI and let it call the function if needed
        const result = await generateText({
            model,
            tools,
            prompt: question,
        });

        if(result.toolResults.length > 1) {
            const answer = await generateText({
                model,
                prompt: `answer the following user question: ${question} using the following data: ${JSON.stringify(result.toolResults)}`,
            });

            return successResponse(context, {response: answer});
        } else if(result.toolResults.length == 1) {
            const answer = await generateText({
                model,
                prompt: `"Answer the following user question using the provided object. The object contains the relevant data based on the user's request. if the user wants the profile or is asking for more data return the entire object we give you, never respond with an empty string, otherwise extract the necessary details and respond concisely in a natural, human-friendly manner without disclaimers unless the object is empty. If you cant find the specific field in the object just return the entire object

                User Question: ${question}
                Object: ${JSON.stringify(result.toolResults[0])}`,
            });
            return successResponse(context, {response: answer.text, using: result.toolResults[0].result});
        } else if(result.text){
            return successResponse(context, {response: result.text});
        }
        return context.json({ response: result });
    }

    private getLikes(userId: number, days: number) {
        return Math.round(Math.random() * 100);
    }
    private async getProfile(name: string) {
        const brand = await this.getPrisma().brands.findFirst({
            where: {
                name: name
            },
        });

        if(!brand) return null;

        return await this.getRedis().getFromCache(`brands.${brand.id}.profile`);
    }
}