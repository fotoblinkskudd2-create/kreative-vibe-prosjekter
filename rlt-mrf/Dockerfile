FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY cmd ./cmd
COPY internal ./internal
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/pulseloop ./cmd/pulseloop

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/pulseloop /pulseloop
EXPOSE 8080
USER nonroot
ENTRYPOINT ["/pulseloop"]
