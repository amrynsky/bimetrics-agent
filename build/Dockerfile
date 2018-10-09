FROM node:10.9.0-alpine

RUN apk add --no-cache curl tar bash git ca-certificates

RUN mkdir -p /opt/mobichord
WORKDIR /opt/mobichord

COPY ./content /opt/mobichord
RUN cd /opt/mobichord && npm install --production --quiet --no-optional

ENTRYPOINT ["node", "/opt/mobichord/index.js"]
