# AppsDocker

# Запуск приложений с помощью Docker Compose

В этом репозитории содержатся два  приложения: LingoBot и Calendar. Вы можете легко запустить оба этих приложения с помощью Docker Compose. Ниже приведены инструкции.

## Предварительные требования

- Установленный Docker на вашем компьютере
- Установленный Docker Compose на вашем компьютере

## Запуск приложений

1. Клонируйте репозиторий на ваш компьютер:
    ```sh
    git clone git@github.com:AlinLob/AppsDocker.git
    cd AppsDocker
    ```

2. Выполните сборку Docker-образов с помощью Docker Compose командой:

    ```sh
    docker-compose build
    ```

Эта команда соберет Docker-образы для обоих приложений на основе Dockerfile, указанных в `docker-compose.yml`.


3. Запустите оба приложения с помощью Docker Compose командой:
    Вы можете выбрать один из двух вариантов:

   - **Без флага -d (вывод в терминале):**
     ```sh
     docker compose up
     ```

   - **С флагом -d (запуск на фоне):**
     ```sh
     docker compose up -d
     ```

После выполнения этой команды Docker Compose создаст и запустит контейнеры для обоих приложений.


## Доступ к приложениям

- Приложение LingoBot будет доступно по адресу [LingoBot](https://t.me/LingoExpertBot) в Telegram.
- Приложение Calendar будет доступно по адресу `http://localhost:5000/` в вашем веб-браузере.