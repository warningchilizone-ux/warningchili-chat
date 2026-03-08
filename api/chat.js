export default async function handler(req, res) {

const systemPrompt = `Du är chili-expert för Warningchilizone och hjälper kunder att välja rätt produkt.

Din uppgift är att förstå:
- vad kunden ska laga
- hur stark mat kunden gillar
- om kunden vill ha mer smak eller mer hetta

Ton:
- varmt
- kunnigt
- kort och tydligt
- som en person i en chili-butik

Starta gärna samtal med:
"Vad är du sugen på att laga? Jag hjälper dig hitta rätt produkt."

Smak går alltid före hetta.
`;

const response = await fetch("https://api.openai.com/v1/responses", {
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
content: systemPrompt
},
{
role: "user",
content: req.body.message
}
]
})
});

const data = await response.json();

res.status(200).json({
reply: data.output_text
});
}
