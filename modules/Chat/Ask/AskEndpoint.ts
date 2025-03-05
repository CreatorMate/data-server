import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import env from "../../../src/env";
import {createAzure} from "@ai-sdk/azure";
import {generateObject, generateText, streamText, tool} from "ai";
import {successResponse} from "../../../src/utils/APIResponse/HttpResponse";

export class AskEndpoint extends Endpoint {
    protected readonly description: string = "chat"
    protected readonly group: Groups = Groups.Brands;
    protected readonly method: string = "post";
    protected readonly route: string = '/ask';
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context): Promise<any> {
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
                    //@ts-ignore
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
            const { object } = await generateObject({
                model: model,
                schema: z.object({
                    sections: z.array(
                        z.object({
                            type: z.string(),
                            data: z.any() // data can be text or key-value object
                        })
                    )
                }),
                prompt: `Answer the following user question using the provided object.

    - If the response contains a set of data retrn the data as a key value object with the type object".
    - If the response needs an **explanation**, return a **text** type 

    Example:
    {
        "sections": [
            { "type": "text", "data": "Here is the profile information for CreatorMate:" },
            { 
                "type": "object", 
                "data": {
                    "Username": "trycreatormate",
                    "Biography": "Supporting creators who make art, not ‘content’",
                    "Followers Count": "11,810",
                    "Follows Count": "68",
                    "Media Count": "32",
                    "Website": "https://creatormate.com",
                    "Profile Picture": "[Profile Picture URL]"
                }
            }
        ]
    }
    Example:
    {
        "sections": [
            { "type": "text", "data": "Creatormate has 124324 followers" },
        ]
    }

    User Question: ${question}
    Object: ${JSON.stringify(result.toolResults[0])}`
            });


            return successResponse(context, object);
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

        const object: any =await this.getRedis().getFromCache(`${brand.id}.profile`)
        delete object.username;

        return object;
    }
}