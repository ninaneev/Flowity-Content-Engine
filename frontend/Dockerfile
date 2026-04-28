FROM node:20

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

# 🔥 CORREÇÃO DO BUG DO ROLLDOWN
RUN rm -rf node_modules package-lock.json && npm install

CMD ["npm", "run", "dev"]