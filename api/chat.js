export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(200).json({
      reply: "API:t fungerar. Skicka ett POST-anrop från chatten."
    });
  }

  try {

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "Ingen fråga skickades."
      });
    }

    const systemPrompt = `
Du är chili-expert för Warningchilizone.

Din uppgift är att hjälpa kunder välja rätt chilisås.

Tänk på:
- vad kunden vill laga
- hur stark mat kunden gillar
- rekommendera rätt produkt
- håll svar korta och trevliga
- skriv på svenska
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI error:", data);

      const errorMessage =
        data?.error?.message ||
        data?.message ||
        "OpenAI-anropet misslyckades.";

      return res.status(500).json({
        reply: errorMessage
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      reply: reply || "Jag kunde inte svara just nu."
    });

  } catch (error) {

    console.error("Server error:", error);

    return res.status(500).json({
      reply: "Serverfel i chatten."
    });

  }

}
