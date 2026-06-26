import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const GENERATION_MODEL = process.env.IMAGE_MODEL || "dall-e-3";
const VARIATION_MODEL = "dall-e-2"; // the only OpenAI model that supports true image-to-image variations

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/shared", express.static(path.join(__dirname, "../shared")));

function requireApiKey(res) {
  if (!OPENAI_API_KEY) {
    res.status(500).json({
      error:
        "No OPENAI_API_KEY configured on the server. Copy .env.example to .env and add your key.",
    });
    return false;
  }
  return true;
}

// Generate brand-new art from a text prompt.
app.post("/api/generate", async (req, res) => {
  if (!requireApiKey(res)) return;

  const { prompt, size = "1024x1024", count = 1 } = req.body || {};
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "A text prompt is required." });
  }
  const n = Math.min(Math.max(Number(count) || 1, 1), 4);

  try {
    // dall-e-3 only supports n=1 per request, so fire requests in parallel.
    const requests = Array.from({ length: n }, () =>
      fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GENERATION_MODEL,
          prompt,
          size,
          n: 1,
        }),
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error?.message || "Generation failed");
        return data.data[0];
      })
    );

    const results = await Promise.all(requests);
    const images = results.map((item) => ({
      url: item.url,
      b64: item.b64_json,
    }));
    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message || "Image generation failed." });
  }
});

// Generate "consorts": AI variations derived from a kept image.
app.post("/api/variations", async (req, res) => {
  if (!requireApiKey(res)) return;

  const { imageUrl, count = 2, size = "1024x1024" } = req.body || {};
  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required." });
  }
  const n = Math.min(Math.max(Number(count) || 2, 1), 4);

  try {
    const sourceResp = await fetch(imageUrl);
    if (!sourceResp.ok) throw new Error("Could not fetch source image for variations.");
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
    if (!varResp.ok) throw new Error(data?.error?.message || "Variation request failed");

    const images = data.data.map((item) => ({ url: item.url, b64: item.b64_json }));
    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message || "Variation generation failed." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(OPENAI_API_KEY) });
});

app.listen(PORT, () => {
  console.log(`Art generator running at http://localhost:${PORT}`);
});
