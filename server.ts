import app from "./app";
import { serve } from '@hono/node-server';

const port = 5000;

serve({ port: port, fetch: app.fetch }, (i) => console.log(`listening on port ${i.port}...`))