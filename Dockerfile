FROM node:22.17.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --silent

COPY . .

EXPOSE 3000

CMD ["npm", "start"]