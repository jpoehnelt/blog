import { authenticate } from "@google-cloud/local-auth";
import { v2 as meetV2 } from "@google-apps/meet";
import { google } from "googleapis";

const scopes = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/meetings.space.created",
  "https://www.googleapis.com/auth/meetings.space.readonly",
];

const auth = await authenticate({
  scopes,
  keyfilePath: "./credentials.json",
});

const calendarClient = google.calendar({ version: "v3", auth });

const calendarId = "primary";
const date = new Date().toISOString().split("T")[0];

const event = (
  await calendarClient.events.insert({
    calendarId,
    // required for conferenceData
    conferenceDataVersion: 1,
    resource: {
      summary: "test event",
      description: "description",
      // all day event
      start: {
        date,
      },
      end: {
        date,
      },
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(7),
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    },
  })
).data;

console.log(event);

// get the meeting code from the calendar event
const conferenceId = event.conferenceData.conferenceId;

const meetClient = new meetV2.SpacesServiceClient({ authClient: auth });
const space = (
  await meetClient.getSpace({
    name: `spaces/${conferenceId}`,
  })
)[0];

console.log(space);

const updatedSpace = (
  await meetClient.updateSpace({
    space: { name: space.name, config: { accessType: "OPEN" } },
    updateMask: {
      paths: ["config.access_type"], // must be in snake_case
    },
  })
)[0];

console.log(updatedSpace);
