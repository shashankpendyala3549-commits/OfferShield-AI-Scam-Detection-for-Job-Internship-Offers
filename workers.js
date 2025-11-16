export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      return await handleOpenAIProxy(request, env);
    }
    return new Response("OfferShield Worker OK", { status: 200 });
  }
};

async function handleOpenAIProxy(request, env) {
  const body = await request.text();

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body,
  });

  return openaiRes;
}
