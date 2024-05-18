# LingoBot

Это простой телеграмм-переводчик, созданное на Node.js с использованием библиотеки Telegraf. Ниже приведены шаги для создания и запуска приложения с использованием Docker.

## Предварительные требования

- Установленный Docker на вашем компьютере

## Создание Docker-образа

1. Клонируйте репозиторий на ваш компьютер:
    ```sh
    git clone git@github.com:AlinLob/AppsDocker.git
    cd lingoBot
    ``` 

2. Создайте Docker-образ:
    ```sh
    docker build -t lingobot .
    ```

## Запуск Docker-контейнера
1. Запустите Docker-контейнер:
   Вы можете выбрать один из двух вариантов:

    - **в фоновом режиме**:
        ```sh
        docker run -d --name lingobot-container lingobot
        ```

    - **в режиме, не скрывающем вывод**:
        ```sh
        docker run --name lingobot-container lingobot
        ```

2. После запуска контейнера, бот будет доступен в Telegram для использования.

Теперь вы можете добавить бота в Telegram и отправить ему сообщение для перевода.

Ссылка на бота: [LingoBot](https://t.me/LingoExpertBot)