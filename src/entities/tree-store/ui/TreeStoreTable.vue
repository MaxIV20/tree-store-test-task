<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import { type TreeStoreItem, useTreeStoreTableData } from '../model';

type Props = { items: TreeStoreItem[] };

const { items } = defineProps<Props>();

const { columnDefs, rowData, onGridReady, onGridSizeChanged } =
  useTreeStoreTableData(items);
</script>

<template>
  <AgGridVue
    :columnDefs
    :rowData
    :onGridReady
    :onGridSizeChanged
    domLayout="autoHeight"
  />
</template>
