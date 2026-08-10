import { reactive, type Reactive } from 'vue';
import { type TreeStoreItem } from './tree-store.types';

type ItemId = TreeStoreItem['id'];

export class TreeStore {
  private items: Reactive<TreeStoreItem[]> = reactive([]);

  constructor(initialItems: TreeStoreItem[]) {
    // Клонируем чтобы не изменялись исходные данные
    this.items = this.cloneItems(initialItems);
  }

  private cloneItems(items: TreeStoreItem[]): TreeStoreItem[] {
    // Клонирование через JSON.parse для обычных массивов и объектов работает быстрее чем structuredClone
    return JSON.parse(JSON.stringify(items));
  }

  private checkAvailabilityItem(id: ItemId) {
    if (!this.getItem(id)) {
      throw new Error('Invalid item id');
    }
  }

  private _getAllChildren(parenIds: Array<ItemId>): TreeStoreItem[] {
    const childIds: Array<ItemId> = [];

    const children = this.items.filter((item) => {
      const isChild = item.parent && parenIds.includes(item.parent);
      if (isChild) {
        childIds.push(item.id);
      }
      return isChild;
    });

    if (children.length) {
      children.push(...this._getAllChildren(childIds));
    }

    return children;
  }

  private _getAllParents(parentId: ItemId): TreeStoreItem[] {
    const parentItem = this.getItem(parentId);

    if (parentItem?.parent) {
      return [parentItem, ...this._getAllParents(parentItem.parent)];
    }

    return parentItem ? [parentItem] : [];
  }

  getAll() {
    return this.items;
  }

  // Для несуществующих id возвращает undefined (намеренно, по аналогии с map и set)
  getItem(id: ItemId): TreeStoreItem | undefined {
    return this.items.find((item) => item.id === id);
  }

  getChildren(id: ItemId): TreeStoreItem[] {
    this.checkAvailabilityItem(id);

    return this.items.filter(({ parent }) => parent === id);
  }

  getAllChildren(id: ItemId): TreeStoreItem[] {
    this.checkAvailabilityItem(id);

    return this._getAllChildren([id]);
  }

  getAllParents(id: ItemId) {
    const targetItem = this.getItem(id);

    if (!targetItem) {
      throw new Error('Invalid item id');
    }

    if (!targetItem.parent) {
      return [];
    }

    return this._getAllParents(targetItem.parent);
  }

  addItem(item: TreeStoreItem) {
    this.items.push(item);
  }

  removeItem(id: ItemId) {
    this.items = this.items.filter((item) => item.id !== id);
  }

  updateItem(item: TreeStoreItem) {
    const itemIndex = this.items.findIndex(({ id }) => id === item.id);
    this.items[itemIndex] = item;
  }
}
