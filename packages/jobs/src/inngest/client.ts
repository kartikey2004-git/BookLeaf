import { Inngest } from "inngest";
import { getJobsEnvironment } from "../config/env.js";

const environment = getJobsEnvironment();

export const inngest = new Inngest({
  id: environment.INNGEST_APP_ID,
  ...(environment.INNGEST_EVENT_KEY
    ? { eventKey: environment.INNGEST_EVENT_KEY }
    : {}),
});
