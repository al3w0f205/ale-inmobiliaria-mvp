FROM node:20-alpine

WORKDIR /app

# In development, we mount the volume. But we prepare the image just in case.
COPY package*.json ./
RUN if [ -f "package.json" ]; then npm install; fi

# Copy project files
COPY . .

# Build Next.js in the image
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
