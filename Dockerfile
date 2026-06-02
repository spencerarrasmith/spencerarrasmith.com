FROM nginx:stable-alpine3.23-perl

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config (optional but recommended)
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static site content
COPY html/ /usr/share/nginx/html/

# nginx listens on 80 internally; Caddy will reverse proxy to this
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]