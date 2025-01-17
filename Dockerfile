FROM node:18
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN npx prisma generate
RUN yarn build
EXPOSE 8081
CMD ["node", "dist/src/main.js"]
