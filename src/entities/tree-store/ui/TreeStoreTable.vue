<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import { type TreeStoreItem, useTreeStoreTableData } from '../model';

type Props = { items: TreeStoreItem[] };

const { items } = defineProps<Props>();

const {
  columnDefs,
  rowData,
  getRowId,
  onGridReady,
  onGridSizeChanged,
} = useTreeStoreTableData(items);
</script>

<template>
  <AgGridVue
    :column-defs
    :row-data
    :get-row-id
    tree-data
    tree-data-display-type="custom"
    tree-data-parent-id-field="parent"
    :group-default-expanded="-1"
    dom-layout="autoHeight"
    :on-grid-ready
    :on-grid-size-changed
  />
</template>
