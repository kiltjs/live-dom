
# FROM nitrojs/node-karma:0.5.0 AS builder
FROM nitrojs/node-karma:0.5.0

WORKDIR /app

# COPY package.json /app
# COPY live-dom.js /app
# COPY component.js /app
# COPY Makefile /app
# COPY karma.conf.js /app
# COPY tests /app

ENV DOCKER_CI=1

RUN google-chrome --version
RUN firefox --version

# Creating tar of productions dependencies
# RUN npm install --production && cp -rp ./node_modules /tmp/node_modules

# Copying application code
COPY . /app

# Installing all dependencies
# RUN npm install

# RUN export DISPLAY=:0

# Running tests
RUN make test

# FROM node AS runner
#
# EXPOSE 3000
# WORKDIR /app
#
# # Adding production dependencies to image
# # COPY --from=builder /tmp/node_modules /app/node_modules
#
# # Copying application code
# COPY . /app
#
# CMD npm start
