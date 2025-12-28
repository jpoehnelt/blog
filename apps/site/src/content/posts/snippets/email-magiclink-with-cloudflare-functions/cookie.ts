import { parse } from "cookie";
import { COOKIE_NAME, Func, REDIRECT_LOGIN_RESPONSE } from "./_common";
import sentryPlugin from "@cloudflare/pages-plugin-sentry";

const session: Func = async (context) => {
  const cookie = parse(context.request.headers.get("Cookie") || "");

  let sessionId: string;

  if (cookie && (sessionId = cookie[COOKIE_NAME])) {
    context.data.sessionId = sessionId;
    context.data.email = await context.env.KV.get(sessionId);
    context.data.sentry.setUser({ email: context.data.email });
  }

  return await context.next();
};

const authorize: Func = async (context) => {
  const pathname = new URL(context.request.url).pathname;

  if (/^\/app/gi.test(pathname) && !context.data.email) {
    return REDIRECT_LOGIN_RESPONSE;
  }

  if (/^\/api/gi.test(pathname) && !context.data.email) {
    return new Response(JSON.stringify({ error: "Not authorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    });
  }

  return await context.next();
};

const sentry: Func = (context) => {
  return sentryPlugin({ dsn: context.env.SENTRY_DSN })(context);
};

export const onRequest: Func[] = [sentry, session, authorize];
