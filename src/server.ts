import app from "./app";
import { serve } from '@hono/node-server';
import env from "./env";
serve({ port: env.PORT, fetch: app.fetch }, (i) => console.log(`listening on port ${i.port}...`))