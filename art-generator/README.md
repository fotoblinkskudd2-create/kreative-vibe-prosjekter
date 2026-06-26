# AI Art Generator

Generate AI art from text prompts, keep your favorites, discard the trash, and breed AI-generated "consorts" (variations) from any image you keep.

## How it works

- **Generate** — sends your prompt to OpenAI's image model (`dall-e-3` by default) and renders the results in a gallery.
- **Keep / Discard** — manually mark a piece as a keeper (gold border) or remove it from the gallery.
- **Consorts** — for any image with a hosted URL, asks OpenAI's `dall-e-2` variations endpoint to generate new images derived from it (true image-to-image variation, no prompt needed).

## Setup

```bash
cd art-generator
npm install
cp .env.example .env
# edit .env and set OPENAI_API_KEY=sk-...
npm start
```

Then open http://localhost:3000.

## Notes

- Requires an OpenAI API key with image generation access. Image generation costs money per call — check OpenAI's current pricing.
- Set `IMAGE_MODEL` in `.env` to override the generation model (default `dall-e-3`). Variations always use `dall-e-2`, since it's the only OpenAI model with a dedicated variations endpoint.
