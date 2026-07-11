FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY pkg ./pkg
COPY cmd ./cmd
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/pulsed ./cmd/pulsed

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/pulsed /pulsed
EXPOSE 8080
USER nonroot
ENTRYPOINT ["/pulsed"]
