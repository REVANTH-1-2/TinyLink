# Stage 1: Build React static assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve React via Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy Nginx custom configuration as a template for envsubst
COPY nginx.conf /etc/nginx/templates/default.conf.template
# Copy custom entrypoint to discover DNS resolver
COPY entrypoint.sh /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
