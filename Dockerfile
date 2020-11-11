FROM node:alpine3.10

COPY package.json /opt/abotkit-ui/package.json
WORKDIR /opt/abotkit-ui

RUN npm install

COPY . /opt/abotkit-ui/

RUN npm run build
EXPOSE 80

ENV ABOTKIT_DOLORES_PORT=80
ENV ABOTKIT_MAEVE_URL=http://localhost
ENV ABOTKIT_MAEVE_PORT=3000
ENV ABOTKIT_DOLORES_USE_KEYCLOAK=true
ENV ABOTKIT_DOLORES_KEYCLOAK_URL=localhost
ENV ABOTKIT_DOLORES_KEYCLOAK_PORT=8080

ENTRYPOINT ["node", "dolores.js"]