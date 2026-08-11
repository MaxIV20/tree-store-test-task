import { describe, expect, it } from 'vitest';
import { TreeStore } from './tree-store';
import type { TreeStoreItem } from './tree-store.types';

type BenchmarkResult = {
  method: string;
  averageMs: number;
  minMs: number;
  maxMs: number;
};

const itemsCount = 2_000;
const iterations = 10;

const createItems = (): TreeStoreItem[] =>
  Array.from({ length: itemsCount }, (_, index) => {
    const id = index + 1;
    return {
      id,
      parent: id === 1 ? null : Math.floor(id / 2),
      label: `Элемент ${id}`,
    };
  });

const benchmark = (
  method: string,
  items: TreeStoreItem[],
  operation: (store: TreeStore) => unknown,
): BenchmarkResult => {
  const stores = Array.from({ length: iterations }, () => new TreeStore(items));
  const durations = stores.map((store) => {
    const startedAt = performance.now();

    operation(store);

    return performance.now() - startedAt;
  });

  const total = durations.reduce((sum, duration) => sum + duration, 0);

  return {
    method,
    averageMs: Number((total / iterations).toFixed(3)),
    minMs: Number(Math.min(...durations).toFixed(3)),
    maxMs: Number(Math.max(...durations).toFixed(3)),
  };
};

describe('TreeStore performance', () => {
  it('выводит время выполнения публичных методов', () => {
    const items = createItems();
    const lastItemId = itemsCount;

    const results = [
      benchmark('getAll', items, (store) => store.getAll()),
      benchmark('getItem', items, (store) => store.getItem(lastItemId)),
      benchmark('getChildren', items, (store) => store.getChildren(2)),
      benchmark('getAllChildren', items, (store) => store.getAllChildren(1)),
      benchmark('getAllParents', items, (store) =>
        store.getAllParents(lastItemId),
      ),
      benchmark('addItem', items, (store) =>
        store.addItem({
          id: itemsCount + 1,
          parent: 1,
          label: 'Добавленный элемент',
        }),
      ),
      benchmark('updateItem', items, (store) =>
        store.updateItem({
          id: lastItemId,
          parent: 1,
          label: 'Обновлённый элемент',
        }),
      ),
      benchmark('removeItem', items, (store) => store.removeItem(lastItemId)),
    ];

    console.table(results);

    expect(results).toHaveLength(8);
    expect(
      results.every(
        ({ averageMs, minMs, maxMs }) =>
          averageMs >= 0 && minMs >= 0 && maxMs >= 0,
      ),
    ).toBe(true);
  });
});
