import { shallowRef, triggerRef, type ShallowRef } from 'vue';
import { type TreeStoreItem } from './tree-store.types';

type ItemId = TreeStoreItem['id'];

export class TreeStore {
  // Добавляем реактивность, чтобы таблица реагировала изменение элементов
  private items: ShallowRef<TreeStoreItem[]> = shallowRef([]);

  // Используем индекс смежности для быстрого поиска дочерних элементов
  private childrenByParent: Map<ItemId | null, TreeStoreItem[]> = new Map();

  // Для быстрого поиска элементов (чтобы не приходилось перебирать весь массив)
  private itemsMap: Map<ItemId, TreeStoreItem> = new Map();

  constructor(initialItems: TreeStoreItem[]) {
    // Клонируем чтобы не изменялись исходные данные
    this.items.value = this.cloneItems(initialItems);
    this.buildItemsMap();
  }

  private cloneItems(items: TreeStoreItem[]): TreeStoreItem[] {
    return JSON.parse(JSON.stringify(items));
  }

  private buildItemsMap() {
    this.items.value.forEach((item) => {
      this.itemsMap.set(item.id, item);

      const parentItem = this.childrenByParent.get(item.parent);

      if (parentItem) {
        parentItem.push(item);
      } else {
        this.childrenByParent.set(item.parent, [item]);
      }
    });
  }

  private checkAvailabilityItem(id: ItemId) {
    if (!this.getItem(id)) {
      throw new Error('Invalid item id');
    }
  }

  getAll() {
    return this.items.value;
  }

  getItem(id: ItemId): TreeStoreItem | undefined {
    return this.itemsMap.get(id);
  }

  getChildren(id: ItemId): TreeStoreItem[] {
    this.checkAvailabilityItem(id);
    return this.childrenByParent.get(id) ?? [];
  }

  getAllChildren(id: ItemId): TreeStoreItem[] {
    const children = [...this.getChildren(id)];
    let nextChildren = children;

    do {
      const localChildren: TreeStoreItem[] = [];
      nextChildren.forEach((item) => {
        localChildren.push(...this.getChildren(item.id));
      });
      children.push(...localChildren);
      nextChildren = localChildren;
    } while (nextChildren.length);

    return children;
  }

  getAllParents(id: ItemId) {
    const targetItem = this.getItem(id);

    if (!targetItem) {
      throw new Error('Invalid item id');
    }

    const parents = [targetItem];

    if (!targetItem.parent) {
      return parents;
    }

    let nextParentId: TreeStoreItem['parent'] = targetItem.parent;

    while (nextParentId) {
      const parentEl = this.itemsMap.get(nextParentId);
      if (parentEl) {
        parents.push(parentEl);
      }
      nextParentId = parentEl?.parent ?? null;
    }

    return parents;
  }

  addItem(item: TreeStoreItem) {
    this.items.value.push(item);
    this.itemsMap.set(item.id, item);
    const parentItem = this.childrenByParent.get(item.parent);

    if (parentItem) {
      parentItem.push(item);
    } else {
      this.childrenByParent.set(item.parent, [item]);
    }

    triggerRef(this.items);
  }

  removeItem(id: ItemId) {
    const deletedItem = this.getItem(id);
    const deletedIds = [id, ...this.getChildren(id).map(({ id }) => id)];

    this.items.value = this.items.value.filter(
      (item) => !deletedIds.includes(item.id),
    );
    this.itemsMap.delete(id);

    const parentId = deletedItem?.parent ?? null;
    const parentItems = this.childrenByParent.get(parentId);
    const items = parentItems?.filter((item) => item.id !== id) ?? [];
    this.childrenByParent.set(parentId, items);
  }

  updateItem(item: TreeStoreItem) {
    const editItem = this.itemsMap.get(item.id);
    if (!editItem) return;
    // Изменяем объект по ссылке, чтобы не искать его в каждой коллекции
    Object.assign(editItem, item);

    triggerRef(this.items);
  }
}
