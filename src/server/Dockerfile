FROM node:22.17.0-alpine

WORKDIR /server

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start:server"]