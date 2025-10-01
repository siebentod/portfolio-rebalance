FROM node:18 AS builder
WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Продакшн-образ
FROM node:18-alpine AS runner
WORKDIR /app

# Устанавливаем только production-зависимости
COPY package*.json ./
RUN npm ci --only=production  --legacy-peer-deps

# Копируем необходимые файлы из образа builder
# 

# Если у вас есть дополнительные конфигурации, скопируйте их
# COPY --from=builder /app/некоторый-файл ./некоторый-файл

# Устанавливаем переменные окружения
ENV NODE_ENV production
ENV PORT 3000

# Открываем порт
EXPOSE 3000

# Запускаем Next.js
CMD ["npm", "run", "start"]