import { createApp } from 'vue';
import { router } from './app/router';
import App from '@/app/App.vue';
import {
  ModuleRegistry,
  ColumnAutoSizeModule,
  ColumnHoverModule,
  ClientSideRowModelModule,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

async function init() {
  const app = createApp(App);

  ModuleRegistry.registerModules([
    ColumnAutoSizeModule,
    ColumnHoverModule,
    ClientSideRowModelModule,
    RowGroupingModule,
  ]);

  app.use(router);
  app.mount('#app');
}

init().catch((error) => {
  console.error(error);
});
