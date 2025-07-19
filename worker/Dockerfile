FROM node:22.17.0-alpine

WORKDIR /worker

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

CMD ["npm", "run", "start:worker"]