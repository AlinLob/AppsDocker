# Calendar 

Это простое календарное приложение, созданное на Vue.js. Ниже приведены шаги для создания и запуска приложения с использованием Docker.

## Предварительные требования

- Установленный Docker на вашем компьютере

## Создание Docker-образа

1. Клонируйте репозиторий на ваш компьютер:
    ```sh
    git clone git@github.com:AlinLob/AppsDocker.git
    cd AppsDocker
    cd calendar
    ```

2. Создайте Docker-образ:
    ```sh
    docker build -t calendar .
    ```

## Запуск Docker-контейнера

1. Запустите Docker-контейнер:
    ```sh
    docker run -p 5000:5000 calendar
    ```

2. После запуска контейнера, вы должны увидеть следующий вывод:
    ```plaintext
    App running at:
    - Local:   http://localhost:5000/
    ```

3. Откройте браузер и перейдите по адресу `http://localhost:5000/`, чтобы увидеть приложение.

