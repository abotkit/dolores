FROM node:alpine3.10

COPY package.json /opt/abotkit-ui/package.json
WORKDIR /opt/abotkit-ui

RUN npm install

COPY . /opt/abotkit-ui/

RUN npm run build
EXPOSE 8080

ENV ABOTKIT_DOLORES_PORT=8080

ENTRYPOINT ["node", "dolores.js"]