FROM node:22.17.0-alpine

WORKDIR /worker

ADD https://raw.githubusercontent.com/eficode/wait-for/master/wait-for /usr/local/bin/wait-for
RUN chmod +x /usr/local/bin/wait-for

COPY package*.json ./

RUN npm install --omit=dev

COPY . .


CMD ["wait-for", "redis:6379", "--timeout=15", "--", "npm", "run", "start:worker"]
