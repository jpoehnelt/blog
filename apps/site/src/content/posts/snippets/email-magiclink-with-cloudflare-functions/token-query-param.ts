import { PluginData } from "@cloudflare/pages-plugin-sentry";

export interface Env {
  SENDGRID_API_KEY: string;
  SENTRY_DSN: string;
  EMAIL_REPLY_TO: string;
  EMAIL_FROM: string;
  KV: KVNamespace;
}

export const TOKEN_QUERY_PARAM = "token";
export const EXPIRATION_TTL = 86400;
export const COOKIE_NAME = "sessionId";

export const REDIRECT_LOGIN_RESPONSE = new Response(null, {
  status: 302,
  headers: {
    Location: "/auth",
  },
});

export type Data = {
  sessionId?: string;
  email?: string;
} & PluginData;

export type Func = PagesFunction<Env, any, Data>;
