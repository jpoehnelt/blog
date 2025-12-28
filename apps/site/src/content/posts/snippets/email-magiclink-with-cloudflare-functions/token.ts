export const onRequestGet: Func = async (context) => {
  const token = new URL(context.request.url).searchParams.get(
    TOKEN_QUERY_PARAM,
  );

  let email: string;

  if (token && (email = await context.env.KV.get(token))) {
    await context.env.KV.delete(token);

    const sessionId = crypto.randomUUID();

    await context.env.KV.put(sessionId, email, {
      expirationTtl: EXPIRATION_TTL,
    });

    return new Response(null, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "set-cookie": `${COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; Secure; max-age=${EXPIRATION_TTL}; SameSite=Strict`,
        Location: "/",
      },
      status: 302,
    });
  }

  return REDIRECT_LOGIN_RESPONSE;
};
