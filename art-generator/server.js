import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Kun tillatte OpenAI bildeverter
const ALLOWED_IMAGE_HOSTS = [
  "oaidalleapiprodscus.blob.core.windows.net",
  "dalleproduse.blob.core.windows.net",
];

function isAllowedImageUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_IMAGE_HOSTS.some((host) => parsed.hostname === host);
  } catch {
    return false;
  }
}

const GENERATION_MODEL = process.env.IMAGE_MODEL || "dall-e-3";
const VARIATION_MODEL = "dall-e-2";

const ALLOWED_SIZES = ["256x256", "512x512", "1024x1024", "1024x1792", "1792x1024"];

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

function requireApiKey(res) {
  if (!OPENAI_API_KEY) {
    res.status(500).json({
      error: "Ingen OPENAI_API_KEY konfigurert. Kopier .env.example til .env og legg inn nøkkelen.",
    });
    return false;
  }
  return true;
}

// POST /api/generate — generer kunst fra tekstprompt
app.post("/api/generate", async (req, res, next) => {
  if (!requireApiKey(res)) return;

  const { prompt, size = "1024x1024", count = 1, style } = req.body || {};
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Et tekstprompt er påkrevd." });
  }
  if (!ALLOWED_SIZES.includes(size)) {
    return res.status(400).json({ error: `size må være én av: ${ALLOWED_SIZES.join(", ")}` });
  }
  const n = Math.min(Math.max(Number(count) || 1, 1), 4);

  const finalPrompt = style ? `${prompt.trim()}, ${style}` : prompt.trim();

  try {
    const requests = Array.from({ length: n }, () =>
      fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GENERATION_MODEL,
          prompt: finalPrompt,
          size,
          n: 1,
        }),
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error?.message || "Generering feilet");
        return data.data[0];
      })
    );

    const results = await Promise.all(requests);
    const images = results.map((item) => ({ url: item.url, b64: item.b64_json }));
    res.json({ images });
  } catch (err) {
    next(err);
  }
});

// POST /api/variations — generer variasjoner fra eksisterende bilde
app.post("/api/variations", async (req, res, next) => {
  if (!requireApiKey(res)) return;

  const { imageUrl, count = 2, size = "1024x1024" } = req.body || {};
  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl er påkrevd." });
  }
  if (!isAllowedImageUrl(imageUrl)) {
    return res.status(400).json({
      error: "imageUrl må være en HTTPS-URL fra en godkjent OpenAI bildever.",
    });
  }
  if (!ALLOWED_SIZES.includes(size)) {
    return res.status(400).json({ error: `size må være én av: ${ALLOWED_SIZES.join(", ")}` });
  }
  const n = Math.min(Math.max(Number(count) || 2, 1), 4);

  try {
    const sourceResp = await fetch(imageUrl);
    if (!sourceResp.ok) throw new Error("Kunne ikke hente kildebilde for variasjoner.");
    const sourceBuffer = Buffer.from(await sourceResp.arrayBuffer());

    const form = new FormData();
    form.append("image", new Blob([sourceBuffer], { type: "image/png" }), "source.png");
    form.append("model", VARIATION_MODEL);
    form.append("n", String(n));
    form.append("size", size);

    const varResp = await fetch("https://api.openai.com/v1/images/variations", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });
    const data = await varResp.json();
    if (!varResp.ok) throw new Error(data?.error?.message || "Variasjonsforespørsel feilet");

    const images = data.data.map((item) => ({ url: item.url, b64: item.b64_json }));
    res.json({ images });
  } catch (err) {
    next(err);
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, model: GENERATION_MODEL });
});

// Sentral feilhåndtering
app.use((err, req, res, next) => {
  console.error("[art-generator]", err);
  if (res.headersSent) return next(err);
  res.status(502).json({ error: err.message || "Noe gikk galt på serveren." });
});

process.on("unhandledRejection", (reason) => {
  console.error("[art-generator] unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[art-generator] uncaughtException:", err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`AI Kunstgenerator kjører på http://localhost:${PORT}`);
});
