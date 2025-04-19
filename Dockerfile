FROM node:16-alpine

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Tạo thư mục images và uploads
RUN mkdir -p public/images/news public/images/services public/uploads

# Expose cổng
EXPOSE 3000

# Cài đặt PM2 globally
RUN npm install pm2 -g

# Start với PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
