# Node 22.6+ kreves for --experimental-transform-types.
FROM node:22-alpine

# Docker-klienten trengs bare i vaktbikkje-tjenesten, men imaget deles.
RUN apk add --no-cache docker-cli

WORKDIR /app

# Ingen produksjonsavhengigheter: TypeScript kjøres direkte av Node, og
# testkjører, typesjekk og Redis-klient er skrevet ut i repoet. Det er et
# bevisst valg for komponenten som avgjør om systemet lever — den skal ikke
# kunne feile på en avhengighetsoppgradering.
COPY package.json tsconfig.json ./
COPY src ./src
COPY test ./test

# Kjør som ikke-privilegert bruker. Vaktbikkja trenger docker-gruppen for å nå
# sokkelen; legg den til i compose om verten krever det.
USER node

ENV NODE_ENV=production

CMD ["node", "--experimental-transform-types", "src/demo.ts"]
