import type { Handler } from "@netlify/functions";
import type { HandlerResponse } from "@netlify/functions";

const STRAVA_AUTHORIZE_URL = `https://www.strava.com/api/v3/oauth/authorize`;


export const handler: Handler = async (event): Promise<HandlerResponse> => {
    const { host } = new URL(event.rawUrl);
    const redirect_uri = `https://${host}/api/strava/callback`;
    const state = {};

    const location =
        `${STRAVA_AUTHORIZE_URL}?state=${encodeURIComponent(
            JSON.stringify(state)
        )}&response_type=code&client_id=${process.env.STRAVA_CLIENT_ID}&scope=activity%3Aread_all&redirect_uri=${redirect_uri}`
        ;

    return {
        statusCode: 302,
        headers: {
            'Location': location,
        },

    }

}