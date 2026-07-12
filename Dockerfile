FROM nginx:stable-alpine3.23-perl

ARG GIT_TAG=dev

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static site content
COPY html/ /usr/share/nginx/html/

# Write version.json into the served directory
RUN echo "{\"version\":\"${GIT_TAG}\"}" > /usr/share/nginx/html/version.json

# nginx listens on 80 internally; Caddy will reverse proxy to this
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]