import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import {InstagramConnector} from "../../../src/utils/InstagramConnector/InstagramConnector";
import {InstagramComment} from "../../../src/utils/InstagramConnector/types/InstagramPostTypes";
import env from "../../../src/env";
import {createAzure} from "@ai-sdk/azure";
import {generateText} from "ai";

export class GetContentCommentsEndpoint extends Endpoint {
    protected readonly method: string = 'get'
    protected readonly route: string = '/content/comments'
    protected readonly group: Groups = Groups.Profiles
    protected readonly description: string = 'Get the profile(s) demographics';
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const {postId, igId} = context.req.query();

        if(!postId || !igId) return errorResponse(context, "INVALID_REQUEST", 421);

        const instagramComments: InstagramComment[] = await InstagramConnector.content().getPostComments(postId, igId);

        if(instagramComments.length === 0) return errorResponse(context, "INVALID_REQUEST", 421);

        const key = env?.AZURE_AI_KEY ?? '';
        const azure = createAzure({
            resourceName: 'creatormate-ai',
            apiKey: key
        });
        const model = azure('gpt-4o-mini');

        const result = await generateText({
            model,
            prompt: "**Goal:**\n" +
                "The goal of this prompt is to instruct an AI model to analyze content reactions, similar to how this tool does. The model should be able to:\n" +
                "* **Sentiment Analysis:** Determine the emotional tone of each reaction (very positive, positive, neutral, negative, very negative).\n" +
                "* **Emotion Recognition:** Identify the specific emotions in each reaction (enthusiasm, appreciation, confusion, encouragement, criticism, frustration, admiration, anger/disgust, concern).\n" +
                "* **Question Analysis:** Identify, **generalize**, and summarize recurring questions.\n" +
                "* **Topic Analysis:** Identify the main topics in the reactions.\n" +
                "* **Reporting:** Generate a structured report with the results of the analysis, including answers to specific questions.\n" +
                "**Detailed Instructions:**\n" +
                "1.  **Input:**\n" +
                "    * The input for the model is a dataset of reactions. Each reaction contains:\n" +
                "        * A timestamp.\n" +
                "        * The text of the reaction.\n" +
                "        * A unique ID.\n" +
                "2.  **Sentiment Analysis:**\n" +
                "    * Use a sentiment analysis model to determine the emotional tone of each reaction.\n" +
                "    * Divide the sentiment into five categories:\n" +
                "        * Very Positive: Expressions of intense joy, praise, or gratitude.\n" +
                "        * Positive: Expressions of joy, praise, or gratitude.\n" +
                "        * Neutral: Objective comments or questions.\n" +
                "        * Negative: Expressions of dissatisfaction, criticism, or aversion.\n" +
                "        * Very Negative: Expressions of intense dissatisfaction, anger, or hatred.\n" +
                "3.  **Emotion Recognition:**\n" +
                "    * Identify the specific emotions in each reaction using an emotion recognition model.\n" +
                "    * Use the following emotion categories:\n" +
                "        * Enthusiasm.\n" +
                "        * Appreciation.\n" +
                "        * Confusion.\n" +
                "        * Encouragement.\n" +
                "        * Criticism.\n" +
                "        * Frustration.\n" +
                "        * Admiration.\n" +
                "        * Anger/Disgust.\n" +
                "        * Concern.\n" +
                "4.  **Question Analysis:**\n" +
                "    * Identify recurring questions in the reactions.\n" +
                "    * **Generalize questions that are semantically similar or related to the same topics.**\n" +
                "    * Group these generalized questions.\n" +
                "    * Count how many times each **generalized** question is asked.\n" +
                "    * Summarize the essence of each **generalized** question.\n" +
                "5.  **Topic Analysis:**\n" +
                "    * Identify the main topics discussed in the reactions.\n" +
                "    * Link the sentiments to the topics.\n" +
                "6.  **Reporting:**\n" +
                "    * Generate a structured report with the following information:\n" +
                "        * Summary of the reaction analysis (number of reactions per sentiment and emotion).\n" +
                "        * Analysis of the reactions (answers to the following specific questions):\n" +
                "            * Are the viewers generally positive or negative about the content?\n" +
                "            * Are there recurring reactions beyond standard emojis, etc.?\n" +
                "            * Do people ask for more information/context?\n" +
                "            * Are there certain things mentioned in the comments?\n" +
                "            * Most discussed topic?\n" +
                "            * Viral elements?\n" +
                "            * Are the comments being responded to?\n" +
                "            * Comparisons with other content?\n" +
                "        * Overview of asked **(generalized)** questions (number of times asked, topic).\n" +
                "        * Sentiment per topic.\n" +
                "        * Key insights and recommendations.\n" +
                "7.  **Output Format:**\n" +
                "    * The report should be generated in a readable format, such as a table or a list.\n" +
                "    * Ensure that the answers to the specific questions are clear and concise, with relevant quotes or examples from the reactions.\n" +
                "**Data Input Field:**\n" +
                "```json" +
                `${JSON.stringify(instagramComments)}` +
                "```\n" +
                "**Example of Output:**\n" +
                "```\n" +
                "Summary of Reaction Analysis:\n" +
                "Sentiment:\n" +
                "Very Positive: 12 (15.38%)\n" +
                "Positive: 18 (23.08%)\n" +
                "Neutral: 0 (0.00%)\n" +
                "Negative: 28 (35.90%)\n" +
                "Very Negative: 20 (25.64%)\n" +
                "Emotions:\n" +
                "Enthusiasm: 12 (11.01%)\n" +
                "Appreciation: 18 (16.51%)\n" +
                "Confusion: 26 (23.85%)\n" +
                "...\n" +
                "Analysis of Reactions:\n" +
                "Are the viewers generally positive or negative about the content?\n" +
                "Answer: Mixed, with a tendency towards negative.\n" +
                "Quotes: \"Great video! I really enjoyed it.\" (Positive), \"This is really bad. I'm wasting my time.\" (Negative)\n" +
                "Are there recurring reactions beyond standard emojis, etc.?\n" +
                "Answer: Yes, many questions for clarification and repeated sentiments.\n" +
                "Quotes: \"I don't understand. Can you explain?\", \"This is really great, I'm going to share this with my friends!\" (Repeated sentiments)\n" +
                "...\n" +
                "Overview of asked (generalized) questions:\n" +
                "Question: I have a question, how did you do this?\n" +
                "Number: 26\n" +
                "Topic: Explanation of how the video was made.\n" +
                "Sentiment per Topic:\n" +
                "Topic: Explanation of how the video was made.\n" +
                "Sentiment: Neutral (100%)\n" +
                "Key Insights:\n" +
                "...\n" +
                "```",
        });

        return successResponse(context, {
            result: result.text,
            prompt: "**Goal:**\n" +
                "The goal of this prompt is to instruct an AI model to analyze content reactions, similar to how this tool does. The model should be able to:\n" +
                "* **Sentiment Analysis:** Determine the emotional tone of each reaction (very positive, positive, neutral, negative, very negative).\n" +
                "* **Emotion Recognition:** Identify the specific emotions in each reaction (enthusiasm, appreciation, confusion, encouragement, criticism, frustration, admiration, anger/disgust, concern).\n" +
                "* **Question Analysis:** Identify, **generalize**, and summarize recurring questions.\n" +
                "* **Topic Analysis:** Identify the main topics in the reactions.\n" +
                "* **Reporting:** Generate a structured report with the results of the analysis, including answers to specific questions.\n" +
                "**Detailed Instructions:**\n" +
                "1.  **Input:**\n" +
                "    * The input for the model is a dataset of reactions. Each reaction contains:\n" +
                "        * A timestamp.\n" +
                "        * The text of the reaction.\n" +
                "        * A unique ID.\n" +
                "2.  **Sentiment Analysis:**\n" +
                "    * Use a sentiment analysis model to determine the emotional tone of each reaction.\n" +
                "    * Divide the sentiment into five categories:\n" +
                "        * Very Positive: Expressions of intense joy, praise, or gratitude.\n" +
                "        * Positive: Expressions of joy, praise, or gratitude.\n" +
                "        * Neutral: Objective comments or questions.\n" +
                "        * Negative: Expressions of dissatisfaction, criticism, or aversion.\n" +
                "        * Very Negative: Expressions of intense dissatisfaction, anger, or hatred.\n" +
                "3.  **Emotion Recognition:**\n" +
                "    * Identify the specific emotions in each reaction using an emotion recognition model.\n" +
                "    * Use the following emotion categories:\n" +
                "        * Enthusiasm.\n" +
                "        * Appreciation.\n" +
                "        * Confusion.\n" +
                "        * Encouragement.\n" +
                "        * Criticism.\n" +
                "        * Frustration.\n" +
                "        * Admiration.\n" +
                "        * Anger/Disgust.\n" +
                "        * Concern.\n" +
                "4.  **Question Analysis:**\n" +
                "    * Identify recurring questions in the reactions.\n" +
                "    * **Generalize questions that are semantically similar or related to the same topics.**\n" +
                "    * Group these generalized questions.\n" +
                "    * Count how many times each **generalized** question is asked.\n" +
                "    * Summarize the essence of each **generalized** question.\n" +
                "5.  **Topic Analysis:**\n" +
                "    * Identify the main topics discussed in the reactions.\n" +
                "    * Link the sentiments to the topics.\n" +
                "6.  **Reporting:**\n" +
                "    * Generate a structured report with the following information:\n" +
                "        * Summary of the reaction analysis (number of reactions per sentiment and emotion).\n" +
                "        * Analysis of the reactions (answers to the following specific questions):\n" +
                "            * Are the viewers generally positive or negative about the content?\n" +
                "            * Are there recurring reactions beyond standard emojis, etc.?\n" +
                "            * Do people ask for more information/context?\n" +
                "            * Are there certain things mentioned in the comments?\n" +
                "            * Most discussed topic?\n" +
                "            * Viral elements?\n" +
                "            * Are the comments being responded to?\n" +
                "            * Comparisons with other content?\n" +
                "        * Overview of asked **(generalized)** questions (number of times asked, topic).\n" +
                "        * Sentiment per topic.\n" +
                "        * Key insights and recommendations.\n" +
                "7.  **Output Format:**\n" +
                "    * The report should be generated in a readable format, such as a table or a list.\n" +
                "    * Ensure that the answers to the specific questions are clear and concise, with relevant quotes or examples from the reactions.\n" +
                "**Data Input Field:**\n" +
                "```json" +
                `${JSON.stringify(instagramComments)}` +
                "```\n" +
                "**Example of Output:**\n" +
                "```\n" +
                "Summary of Reaction Analysis:\n" +
                "Sentiment:\n" +
                "Very Positive: 12 (15.38%)\n" +
                "Positive: 18 (23.08%)\n" +
                "Neutral: 0 (0.00%)\n" +
                "Negative: 28 (35.90%)\n" +
                "Very Negative: 20 (25.64%)\n" +
                "Emotions:\n" +
                "Enthusiasm: 12 (11.01%)\n" +
                "Appreciation: 18 (16.51%)\n" +
                "Confusion: 26 (23.85%)\n" +
                "...\n" +
                "Analysis of Reactions:\n" +
                "Are the viewers generally positive or negative about the content?\n" +
                "Answer: Mixed, with a tendency towards negative.\n" +
                "Quotes: \"Great video! I really enjoyed it.\" (Positive), \"This is really bad. I'm wasting my time.\" (Negative)\n" +
                "Are there recurring reactions beyond standard emojis, etc.?\n" +
                "Answer: Yes, many questions for clarification and repeated sentiments.\n" +
                "Quotes: \"I don't understand. Can you explain?\", \"This is really great, I'm going to share this with my friends!\" (Repeated sentiments)\n" +
                "...\n" +
                "Overview of asked (generalized) questions:\n" +
                "Question: I have a question, how did you do this?\n" +
                "Number: 26\n" +
                "Topic: Explanation of how the video was made.\n" +
                "Sentiment per Topic:\n" +
                "Topic: Explanation of how the video was made.\n" +
                "Sentiment: Neutral (100%)\n" +
                "Key Insights:\n" +
                "...\n" +
                "```",
        });
    }
}