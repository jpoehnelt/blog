export const onRequestGet: Func = async (context) => {
  return new Response(JSON.stringify({ email: context.data.email }), {
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });
};