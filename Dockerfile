FROM node:16.14.2-alpine
ARG ENVIRONMENT
RUN mkdir -p /code
WORKDIR /code
ADD . /code
RUN yarn install && \
    if [ "$ENVIRONMENT" == "production" ]; then echo "Building $ENVIRONMENT" && yarn build:prod; else echo "Building $ENVIRONMENT" && yarn build:staging; fi && \
    yarn cache clean && \
    mv dist / && rm -rf ./* && mv /dist ./
