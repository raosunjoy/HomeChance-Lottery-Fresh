FROM node:20

WORKDIR /app

COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
