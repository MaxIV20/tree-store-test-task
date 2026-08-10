import { createApp } from 'vue';
import { router } from './app/router';
import App from '@/app/App.vue';

function init() {
  const app = createApp(App);

  app.use(router);
  app.mount('#app');
}

init();
