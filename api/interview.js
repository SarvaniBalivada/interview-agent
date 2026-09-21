// Vercel serverless function.
// Keeps your Anthropic API key server-side — the browser never sees it.
// Deploy: set ANTHROPIC_API_KEY in your Vercel project's Environment Variables.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let reqBody;
  try {
    if (req.json && typeof req.json === "function") {
      reqBody = await req.json();
    } else {
      reqBody = req.body || {};
    }
  } catch (e) {
    reqBody = {};
  }
  const { prompt } = reqBody;
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing 'prompt' in request body" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY. Set it in your hosting provider's environment variables." });
    return;
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 900,
        system: "You must respond with ONLY valid JSON. No markdown code fences, no commentary, no preamble, no trailing text — the entire response body must be a single parseable JSON value.",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: (data.error && data.error.message) || "Anthropic API error" });
      return;
    }

    const text = (data.content || [])
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      res.status(502).json({ error: "Model did not return valid JSON", raw: cleaned.slice(0, 500) });
      return;
    }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: String((err && err.message) || err) });
  }
}
