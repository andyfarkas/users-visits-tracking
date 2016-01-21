FROM node:wheezy
RUN npm install -g nodemon
COPY src /usr/src/app
WORKDIR /usr/src/app
RUN npm install
CMD nodemon