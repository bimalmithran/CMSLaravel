FROM php:8.4-cli

WORKDIR /app

RUN apt-get update \
    && apt-get install -y \
       git \
       unzip \
       libzip-dev \
       libpng-dev \
       libonig-dev \
    && docker-php-ext-install pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer \
    | php -- --install-dir=/usr/local/bin --filename=composer

COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-scripts --prefer-dist || true

COPY . /app

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

