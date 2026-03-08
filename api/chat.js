export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "GET fungerar"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const message = req.body?.message;

    if (!message) {
      return res.status(400).json({
        ok: false,
        error: "Ingen message skickades in"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "OPENAI_API_KEY saknas i Vercel"
      });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Du är en hjälpsam chili-expert för Warningchilizone. Svara kort på svenska."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      return res.status(500).json({
        ok: false,
        error: data?.error?.message || "OpenAI-anropet misslyckades",
        full: data
      });
    }

    return res.status(200).json({
      ok: true,
      reply: data?.choices?.[0]?.message?.content || "Tomt svar från OpenAI",
      raw: data
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Okänt serverfel"
    });
  }
}
