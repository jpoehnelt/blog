export const onRequestPost: Func = async (context) => {
  const email = (await context.request.formData()).get("email");

  if (!email) {
    return REDIRECT_LOGIN_RESPONSE;
  }

  const token = crypto.randomUUID();
  // persist opaque token that expires in 5 minutes
  await context.env.KV.put(token, email, { expirationTtl: 60 * 5 });

  const url = `${
    new URL(context.request.url).href
  }?${TOKEN_QUERY_PARAM}=${encodeURIComponent(token)}`;

  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${context.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email }],
          dynamic_template_data: {
            loginLink: url,
          },
        },
      ],
      from: { email: context.env.EMAIL_FROM },
      reply_to: { email: context.env.EMAIL_REPLY_TO },
      template_id: "d-1368124dc6e34f879245d3f23cb36f55",
    }),
  });

  return new Response(null, {
    headers: {
      Location: "/auth/sent", // Redirect to a page that says "Check your email"
    },
    status: 302,
  });
};
