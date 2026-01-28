FROM node:20-trixie-slim as builder
# FROM node:20-trixie as builder

WORKDIR /app

# RUN apt update && apt -y install iputils-ping net-tools netcat-openbsd httpie curl

# Accept build argument for client-side log level
ARG VITE_LOG_LEVEL=info

COPY . /app
RUN npm install
# Pass VITE_LOG_LEVEL to the build process
RUN VITE_LOG_LEVEL=${VITE_LOG_LEVEL} npm run build



FROM node:20-trixie-slim as runner
# FROM node:20-trixie as runner

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

RUN apt-get update && apt-get -y install netcat-openbsd iproute2 net-tools iputils-ping telnet procps neovim

COPY package.json /app/package.json
RUN npm install
RUN npm ci --only=production

COPY --from=builder /app/build /app/build
COPY server.js /app/server.js
COPY logger.js /app/logger.js

EXPOSE 8444

CMD ["node", "-r", "dotenv/config", "./server.js"]
