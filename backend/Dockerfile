FROM node:20-alpine

WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build TypeScript
COPY . .
RUN npm run build

# Create public uploads directory
RUN mkdir -p public/uploads

EXPOSE 10000

CMD ["npm", "start"]
