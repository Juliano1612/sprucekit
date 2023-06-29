FROM node:18
LABEL maintainer "hello@spruceid.com"
COPY ./ /root/sprucekit
RUN cd /root/sprucekit && yarn --unsafe-perm
EXPOSE 3000
WORKDIR /root/sprucekit/examples/sprucekit-test-app
ENTRYPOINT ["yarn", "start"]
CMD []
