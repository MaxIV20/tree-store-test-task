import { ref, computed } from 'vue';
import type { ColDef, GridSizeChangedEvent } from 'ag-grid-community';
import { TreeStore } from './tree-store';
import { type TreeStoreItem } from './tree-store.types';

export function useTreeStoreTableData(items: TreeStoreItem[]) {
  const treeStoreInstance = new TreeStore(items);

  const rowData = computed(() => {
    return treeStoreInstance.getAll();
  });

  const columnDefs = ref<ColDef<TreeStoreItem>[]>([
    { field: 'id' },
    { field: 'parent' },
    { field: 'label' },
  ]);

  // Растягивает все колонки, чтобы они заполнили 100% ширины grid-контейнера
  const onGridReady = (event: GridSizeChangedEvent) => {
    console.log(event);
    event.api.sizeColumnsToFit();
  };

  // Динамически пересчитываем ширину колонок при любом изменении размеров таблицы
  const onGridSizeChanged = (event: GridSizeChangedEvent) => {
    event.api.sizeColumnsToFit();
  };

  return { columnDefs, rowData, onGridReady, onGridSizeChanged };
}
