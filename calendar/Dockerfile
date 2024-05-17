FROM node:22

WORKDIR /usr/app/calendar

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=5000

EXPOSE 5000

CMD ["npm", "run", "serve"]