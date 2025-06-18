FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# Expose the correct port for this servic
EXPOSE 3002

CMD [ "node", "index.js" ]