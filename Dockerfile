FROM node:16.11.1-alpine3.14

ARG UID=1001
ARG GID=1001

RUN addgroup -S syncingserver -g $GID && adduser -D -S syncingserver -G syncingserver -u $UID

RUN apk add --update --no-cache \
    alpine-sdk \
    python3

WORKDIR /var/www

RUN chown -R $UID:$GID .

USER syncingserver

COPY --chown=$UID:$GID package.json yarn.lock /var/www/

RUN yarn install --pure-lockfile

COPY --chown=$UID:$GID . /var/www

RUN NODE_OPTIONS="--max-old-space-size=2048" yarn build

ENTRYPOINT [ "docker/entrypoint.sh" ]

CMD [ "start-web" ]
