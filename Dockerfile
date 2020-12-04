FROM node:14.15.1-alpine

ARG UID=1001
ARG GID=1001

RUN addgroup -S syncingserver -g $GID && adduser -D -S syncingserver -G syncingserver -u $UID

WORKDIR /var/www

RUN chown -R $UID:$GID .

USER syncingserver

COPY --chown=$UID:$GID package.json yarn.lock /var/www/

RUN yarn install --frozen-lockfile

COPY --chown=$UID:$GID . /var/www

RUN yarn build

ENTRYPOINT [ "docker/entrypoint.sh" ]

CMD [ "start-web" ]
