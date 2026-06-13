# Readme

## Local development
While the website contents are built into the container, the local development directory may be mounted into the container directly for more rapid iteration:

`docker build -t spencerarrasmith.com:dev .`

`docker run -d --name spencerarrasmith-dev --restart unless-stopped -p 127.0.0.1:8001:80 -v {project dir}:/usr/share/nginx/html:ro spencerarrasmith.com:dev`

## Releases
A Github Action will trigger a container build upon creation of a new tag at the remote:

`git tag {version}`

`git push --tags`

## Deployment
The container is available at `ghcr.io/spencerarrasmith/spencerarrasmith.com:latest` or a specific tag. This has been configured within `docker-compose.yml`:

```yml
services:

  spencerarrasmith:
    image: ghcr.io/spencerarrasmith/spencerarrasmith.com:latest
    container_name: spencerarrasmith-nginx
    restart: unless-stopped
    ports:
      - "127.0.0.1:8001:80"
```

The only commands required to pull the latest version are:

`docker compose down`

`docker compose up`