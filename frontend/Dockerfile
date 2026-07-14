FROM node:20-alpine

WORKDIR /app

# In development, we mount the volume. But we prepare the image just in case.
COPY package*.json ./
RUN if [ -f "package.json" ]; then npm install; fi

# Copy project files
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
