FROM alpine:3.22

ARG PB_VERSION=0.40.6          # pin the current release; check it against the release's checksums.txt

RUN apk add --no-cache ca-certificates wget unzip \
 && wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
 && unzip pocketbase_*.zip -d /pb && rm pocketbase_*.zip

COPY pb_migrations /pb/pb_migrations

EXPOSE 8090

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data", "--migrationsDir=/pb/pb_migrations"]