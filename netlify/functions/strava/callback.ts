
import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import type { Handler, HandlerResponse } from "@netlify/functions";


export interface Connection {
    access_token: string;
    athlete: any;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    token_type: string;
    sync?: boolean;
}

export const handler: Handler = async (event): Promise<HandlerResponse> => {
    const code = event.queryStringParameters.code;


    let response: AxiosResponse<Connection>;
    const url = `https://www.strava.com/oauth/token?client_id=${process.env.STRAVA_OAUTH_CLIENT_ID}&client_secret=${process.env.STRAVA_OAUTH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code`;

    try {
        response = await axios.post(url, {});
    } catch (error) {
        const e = error as AxiosError;
        throw new Error(
            JSON.stringify(
                {
                    data: e.response?.data,
                    status: e.response?.status,
                    headers: e.response?.headers,
                },
                null,
                2
            )
        );
    }

    return {
        statusCode: 200,
        body: JSON.stringify(response.data)
    };

}

