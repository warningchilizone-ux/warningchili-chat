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
    const message = req.body?.message;

    if (!message) {
      return res.status(400).json({
        reply: "Inget meddelande skickades."
      });
    }

    const systemPrompt = `Du är chili-expert för Warningchilizone och hjälper kunder att välja rätt produkt.

Din uppgift är att förstå:
- vad kunden ska laga
- hur stark mat kunden gillar
- om kunden vill ha smak, vardagschili eller extrem hetta

Ton:
- varmt
- kunnigt
- kort och tydligt
- som en person i en chili-butik

Undvik säljiga formuleringar. Guidning är viktigare än försäljning.
Smak går alltid före hetta.

Starta gärna samtal med:
"Vad är du sugen på att laga? Jag hjälper dig hitta rätt produkt."

Normalt rekommenderas 1–2 produkter.
Om det hjälper kunden kan upp till 3 produkter nämnas.
Produkter ska alltid kopplas till hur de används i maten.

Styrkeskala:
0–3 mild
4–6 medium
7–9 stark
10+ extrem

Extremprodukter rekommenderas bara om kunden uttryckligen vill ha extrem hetta.

Produkter:
Everyday Dream – 4/10
Mango Dream – mild och fruktig
Habanero Dream – 7/10
Caribbean Kick Dream – 8/10
Fermented Pomegranate Lava Dream – 8/10
Ginger Burn Ferment Dream – 7/10
Another Kimchi Blizz – 6.5/10
Sriracha Verde Dream – 4.5/10
Fermented Acid Rush Dream – 2/10
Habanero Hot Honey – 6/10
Pain Salt – 14/10
Hellmouth Paste – 13/10
Carolina’s Passion Nightmare – 12/10

Skriv personligt, till exempel:
- Jag skulle börja med...
- Jag brukar rekommendera...
- Om du vill ta det ett steg längre...`;

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: systemPrompt
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: message
              }
            ]
          }
        ]
      })
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({
        reply: "OpenAI-anropet misslyckades."
      });
    }

    const reply =
      data.output_text ||
      "Jag kunde inte svara just nu. Försök gärna igen.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      reply: "Serverfel. Försök igen."
    });
  }
}
