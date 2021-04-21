import { hasJsonStructure } from './json';

/**
 *
 * @param property property name.
 * @param storage default value *sessionStorage**.
 */
export const getStoredPropertyValue = (property: string, storage: Storage = sessionStorage) => {
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key) continue;
    const objectValue = storage.getItem(key)!;

    if (hasJsonStructure(objectValue)) {
      const data = JSON.parse(objectValue);
     
      const propertyValue = data[property];
      
      if (propertyValue) return propertyValue;
    }
  }
};
