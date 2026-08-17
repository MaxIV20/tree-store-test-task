import { shallowRef, triggerRef, type ShallowRef } from 'vue';
import { type TreeStoreItem } from './tree-store.types';

type ItemId = TreeStoreItem['id'];

export class TreeStore {
  // Добавляем реактивность, чтобы таблица реагировала изменение элементов
  // По тз об этом не говорится, но раз класс используется в vue, то лишним не будет
  private items: ShallowRef<TreeStoreItem[]> = shallowRef([]);

  constructor(initialItems: TreeStoreItem[]) {
    // Клонируем чтобы не изменялись исходные данные
    this.items.value = this.cloneItems(initialItems);
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

    const children = this.items.value.filter((item) => {
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
    return this.items.value;
  }

  // Для несуществующих id возвращает undefined (намеренно, по аналогии с map и set)
  getItem(id: ItemId): TreeStoreItem | undefined {
    return this.items.value.find((item) => item.id === id);
  }

  getChildren(id: ItemId): TreeStoreItem[] {
    this.checkAvailabilityItem(id);

    return this.items.value.filter(({ parent }) => parent === id);
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
      return [targetItem];
    }

    return [targetItem, ...this._getAllParents(targetItem.parent)];
  }

  addItem(item: TreeStoreItem) {
    this.items.value.push(item);
    triggerRef(this.items);
  }

  removeItem(id: ItemId) {
    const deletedIds = [id, ...this.getChildren(id).map(({ id }) => id)];
    this.items.value = this.items.value.filter(
      (item) => !deletedIds.includes(item.id),
    );
  }

  updateItem(item: TreeStoreItem) {
    const itemIndex = this.items.value.findIndex(({ id }) => id === item.id);
    this.items.value[itemIndex] = item;
    triggerRef(this.items);
  }
}
