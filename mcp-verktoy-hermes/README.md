# MCP-verktøy for Hermes: Reddit-research og markedsinnsikt

Dette prosjektet setter opp **Reddit Research MCP** som en forskningslag for Hermes (AI-agenten), pluss et par andre MCP-servere funnet på GitHub som utfyller research-arbeidsflyten. Idéen kommer fra et Reddit-innlegg om hvordan Reddit Research MCP lar en agent finne relevante subreddits, samle innlegg og kommentarer, sammenligne meninger, og trekke ut ekte innsikt — i stedet for å gjette hva folk mener.

Bruksområder for Hermes:
- Kundesmertepunkter og produkttilbakemeldinger
- Konkurrentklager (f.eks. "hva hater folk ved Lovable, Cursor og Claude Code")
- Nisjemiljøer og kjøpsinnvendinger
- Innholdsidéer og det eksakte språket folk bruker om et problem

## 1. Reddit Research MCP (hovedverktøy)

Repo: https://github.com/king-of-the-grackles/reddit-research-mcp

Hostet, zero-setup MCP-server med semantisk søk på tvers av 20 000+ subreddits. Ingen Reddit API-nøkler kreves — autentisering skjer via Descope OAuth2 første gang serveren kobles til (~30 sekunder).

**Oppsett i Claude Code:**
```bash
claude mcp add --scope local --transport http reddit-research https://reddit-research-mcp.fastmcp.app/mcp
```

**Direkte MCP-URL** (for andre klienter, f.eks. Claude Desktop, Cursor):
```
https://reddit-research-mcp.fastmcp.app/mcp
```

**Verktøy serveren eksponerer:**
| Verktøy | Beskrivelse |
|---|---|
| `discover_operations` | Vis tilgjengelige operasjoner |
| `get_operation_schema` | Se parametere og eksempler |
| `execute_operation` | Kjør en operasjon |

**Kjerneoperasjoner for research:**
1. `discover_subreddits` — semantisk søk blant 20 000+ indekserte communities
2. `search_subreddit` — søk etter innlegg i en spesifikk subreddit
3. `fetch_posts` — hent innlegg (hot, new, top, rising)
4. `fetch_multiple` — batch-hent fra flere subreddits samtidig
5. `fetch_comments` — hent hele kommentartråder

Se [reddit-research-mcp.md](./reddit-research-mcp.md) for detaljert bruk og eksempel-prompts.

## 2. Anbefalt arbeidsflyt for Hermes

1. **Research** — finn relevante subreddits rundt et tema (`discover_subreddits`)
2. **Samle** — hent de mest relevante innleggene og kommentartrådene (`fetch_posts` / `fetch_comments`)
3. **Trekk ut** — identifiser smertepunkter, gjentatte fraser, innvendinger og kjøpssignaler
4. **Omform** — bygg innholdsidéer, annonsevinkler, landingsside-seksjoner eller produktforbedringer basert på funnene

## 3. Andre MCP-servere fra GitHub som utfyller research-laget

| MCP | Repo | Hva den gir Hermes | Auth |
|---|---|---|---|
| **Firecrawl MCP** (offisiell) | [firecrawl/firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server) | Skraper og søker på nettsider (konkurrentnettsider, landingssider, dokumentasjon) — nyttig når innsikten må hentes utenfor Reddit | Gratis nøkkelløs tier (rate-limited), eller `FIRECRAWL_API_KEY` |
| **Exa MCP** (offisiell) | [exa-labs/exa-mcp-server](https://github.com/exa-labs/exa-mcp-server) | Sanntids websøk og "deep search" med sammendrag — bra til å verifisere/utvide funn fra Reddit mot resten av nettet | Native Claude-connector, eller `EXA_API_KEY` |

**Oppsett i Claude Code:**
```bash
# Firecrawl (krever egen API-nøkkel fra firecrawl.dev)
claude mcp add firecrawl -e FIRECRAWL_API_KEY=fc-DIN_NOKKEL -- npx -y firecrawl-mcp

# Exa
claude mcp add --scope local --transport http exa https://mcp.exa.ai/mcp
```

Disse to er valgt fordi de er offisielle, vedlikeholdte repoer med klar auth-modell — i motsetning til de fleste uoffisielle Reddit/Twitter-MCP-klonene på GitHub, som ofte krever egne API-nøkler fra tredjepart og varierer sterkt i kodekvalitet. Reddit Research MCP over dekker selve Reddit-behovet uten den risikoen.

## 4. Samlet config-eksempel (Claude Desktop / andre MCP-klienter)

```json
{
  "mcpServers": {
    "reddit-research": {
      "url": "https://reddit-research-mcp.fastmcp.app/mcp"
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": { "FIRECRAWL_API_KEY": "fc-DIN_NOKKEL" }
    },
    "exa": {
      "url": "https://mcp.exa.ai/mcp"
    }
  }
}
```
