FROM node:12.19.0-alpine

ARG UID=1001
ARG GID=1001

RUN addgroup -S sync -g $GID && adduser -D -S sync -G sync -u $UID

WORKDIR /var/www

RUN chown -R $UID:$GID .

USER sync

COPY --chown=$UID:$GID package.json yarn.lock /var/www/

RUN yarn install --pure-lockfile

COPY --chown=$UID:$GID . /var/www

RUN yarn build

ENTRYPOINT [ "docker/entrypoint.sh" ]

CMD [ "start-web" ]
