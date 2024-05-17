import { createApp } from 'vue';
import App from './App.vue';
import moment from 'moment';
import 'moment/locale/ru';

moment.locale('ru');

const app = createApp(App);

app.config.globalProperties.moment = moment; 

app.mount('#app')