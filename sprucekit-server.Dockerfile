FROM node:18
LABEL maintainer "hello@spruceid.com"
COPY ./ /root/sprucekit
WORKDIR /root/sprucekit
RUN yarn --unsafe-perm
EXPOSE 8443
ENTRYPOINT ["node", "/root/sprucekit/packages/sprucekit-server/bin/sprucekit-server.js"]
CMD []
