FROM node:lts

RUN yarn global add nodemon

WORKDIR /app

COPY . .

RUN yarn install

COPY . .

EXPOSE 5500

CMD ["sh", "run.sh"]