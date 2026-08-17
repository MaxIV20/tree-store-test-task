import { ref, computed } from 'vue';
import type {
  ColDef,
  GridSizeChangedEvent,
  GridReadyEvent,
  ValueGetterParams,
  GetRowIdParams,
} from 'ag-grid-community';
import { TreeStore } from './tree-store';
import { type TreeStoreItem } from './tree-store.types';

export function useTreeStoreTableData(items: TreeStoreItem[]) {
  const treeStoreInstance = new TreeStore(items);

  const rowData = computed(() => {
    return treeStoreInstance.getAll();
  });

  const columnDefs = ref<ColDef<TreeStoreItem>[]>([
    {
      headerName: '№ п\\п',
      valueGetter: 'node.rowIndex + 1',
      width: 50,
    },
    {
      headerName: 'Категория',
      showRowGroup: true,
      cellRenderer: 'agGroupCellRenderer',
      valueGetter(params: ValueGetterParams<TreeStoreItem>) {
        const hasChildren =
          treeStoreInstance.getChildren(params.data?.id ?? '').length > 0;
        return hasChildren ? 'Группа' : 'Элемент';
      },
    },
    { field: 'label', headerName: 'Наименование' },
  ]);

  const getRowId = (params: GetRowIdParams<TreeStoreItem>) =>
    String(params.data.id);

  const onGridReady = (event: GridReadyEvent) => {
    event.api.sizeColumnsToFit();
  };

  // Динамически пересчитываем ширину колонок при любом изменении размеров таблицы
  const onGridSizeChanged = (event: GridSizeChangedEvent) => {
    event.api.sizeColumnsToFit();
  };

  return {
    rowData,
    columnDefs,
    getRowId,
    onGridReady,
    onGridSizeChanged,
  };
}
