import { describe, expect, it } from 'vitest';
import { TreeStore } from './tree-store';
import type { TreeStoreItem } from './tree-store.types';

const initialItems: TreeStoreItem[] = [
  { id: 1, parent: null, label: 'Корень' },
  { id: 2, parent: 1, label: 'Раздел' },
  { id: 3, parent: 1, label: 'Документ' },
  { id: 4, parent: 2, label: 'Подраздел' },
];

const createStore = () => new TreeStore(initialItems);

describe('TreeStore', () => {
  it('хранит копию переданных элементов', () => {
    const sourceItems = [{ id: 1, parent: null, label: 'Исходное значение' }];
    const store = new TreeStore(sourceItems);

    sourceItems[0].label = 'Изменённое значение';

    expect(store.getItem(1)).toEqual({ id: 1, parent: null, label: 'Исходное значение' });
  });

  it('возвращает все элементы и находит элемент по идентификатору', () => {
    const store = createStore();

    expect(store.getAll().value).toEqual(initialItems);
    expect(store.getItem(3)).toEqual({ id: 3, parent: 1, label: 'Документ' });
    expect(store.getItem(999)).toBeUndefined();
  });

  it('возвращает только прямых потомков элемента', () => {
    const store = createStore();

    expect(store.getChildren(1)).toEqual([
      { id: 2, parent: 1, label: 'Раздел' },
      { id: 3, parent: 1, label: 'Документ' },
    ]);
  });

  it('возвращает всех потомков независимо от глубины вложенности', () => {
    const store = createStore();

    expect(store.getAllChildren(1)).toEqual([
      { id: 2, parent: 1, label: 'Раздел' },
      { id: 3, parent: 1, label: 'Документ' },
      { id: 4, parent: 2, label: 'Подраздел' },
    ]);
  });

  it('возвращает цепочку родителей от ближайшего к корню', () => {
    const store = createStore();

    expect(store.getAllParents(4)).toEqual([
      { id: 2, parent: 1, label: 'Раздел' },
      { id: 1, parent: null, label: 'Корень' },
    ]);
    expect(store.getAllParents(1)).toEqual([]);
  });

  it('добавляет, обновляет и удаляет элемент', () => {
    const store = createStore();

    store.addItem({ id: 5, parent: 2, label: 'Новый элемент' });
    store.updateItem({ id: 5, parent: 1, label: 'Обновлённый элемент' });
    store.removeItem(2);

    expect(store.getItem(5)).toEqual({ id: 5, parent: 1, label: 'Обновлённый элемент' });
    expect(store.getItem(2)).toBeUndefined();
  });

  it.each([
    ['getChildren', (store: TreeStore) => store.getChildren(999)],
    ['getAllChildren', (store: TreeStore) => store.getAllChildren(999)],
    ['getAllParents', (store: TreeStore) => store.getAllParents(999)],
  ])('сообщает об отсутствующем элементе в %s', (_, operation) => {
    expect(() => operation(createStore())).toThrow('Invalid item id');
  });
});
