FROM node:alpine3.10

RUN npm install -g serve

COPY package.json /opt/abotkit-ui/package.json
WORKDIR /opt/abotkit-ui

RUN npm install

COPY . /opt/abotkit-ui/

RUN npm run build
EXPOSE 8080

ENTRYPOINT ["serve", "-l", "8080", "-s", "build"]