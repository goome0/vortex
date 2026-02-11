/**
 * Helper type to create the return type after field mapping
 */
type MapFieldsResult<T extends Record<string, any>, M extends Partial<Record<keyof T, string>>> = Omit<T, keyof M> & {
  [K in keyof M as M[K] extends string ? M[K] : never]: K extends keyof T ? T[K] : never;
};

/**
 * Maps and renames fields of an object or array of objects in a type-safe way
 *
 * @template T - Type of the input object
 * @template M - Type of the field mapping (e.g. { oldField: 'newField' })
 *
 * @example
 * // Rename fields of an object
 * const user = { id: 1, firstName: 'John', lastName: 'Doe' };
 * const mapped = mapFields(user, { firstName: 'name', lastName: 'surname' });
 * // Result: { id: 1, name: 'John', surname: 'Doe' }
 *
 * @example
 * // Rename fields of an array
 * const users = [
 *   { id: 1, firstName: 'John' },
 *   { id: 2, firstName: 'Jane' }
 * ];
 * const mapped = mapFields(users, { firstName: 'name' });
 * // Result: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
 *
 * @example
 * // Select only specific fields and rename them
 * const order = { id: 1, total: 100, status: 'pending', createdAt: '2024-01-01' };
 * const mapped = mapFields(order, { total: 'amount', status: 'orderStatus' });
 * // Result: { id: 1, amount: 100, orderStatus: 'pending', createdAt: '2024-01-01' }
 */
export function mapFields<T extends Record<string, any>, M extends Partial<Record<keyof T, string>>>(
  data: T | T[],
  fieldMapping: M,
): T extends any[] ? Array<MapFieldsResult<T, M>> : MapFieldsResult<T, M> {
  if (Array.isArray(data)) {
    return data.map((item) => mapFields(item, fieldMapping)) as any;
  }

  const result = { ...data } as any;

  for (const [oldField, newField] of Object.entries(fieldMapping)) {
    if (oldField && newField && oldField in result) {
      result[newField] = result[oldField];
      delete result[oldField];
    }
  }

  return result;
}

/**
 * Helper type to create the return type after mapping selected fields
 */
type MapSelectedFieldsResult<T extends Record<string, any>, M extends Partial<Record<keyof T, string>>> = {
  [K in keyof M as M[K] extends string ? M[K] : never]: K extends keyof T ? T[K] : never;
};

/**
 * Maps fields by selecting only the specified fields and renaming them
 *
 * @template T - Type of the input object
 * @template M - Type of the field mapping
 *
 * @example
 * const order = { id: 1, total: 100, status: 'pending', createdAt: '2024-01-01' };
 * const mapped = mapSelectedFields(order, { total: 'amount', status: 'orderStatus' });
 * // Result: { amount: 100, orderStatus: 'pending' } (only mapped fields)
 */
export function mapSelectedFields<T extends Record<string, any>, M extends Partial<Record<keyof T, string>>>(
  data: T | T[],
  fieldMapping: M,
): T extends any[] ? Array<MapSelectedFieldsResult<T, M>> : MapSelectedFieldsResult<T, M> {
  if (Array.isArray(data)) {
    return data.map((item) => mapSelectedFields(item, fieldMapping)) as any;
  }

  const result = {} as any;

  for (const [oldField, newField] of Object.entries(fieldMapping)) {
    if (oldField && newField && oldField in data) {
      result[newField] = data[oldField];
    }
  }

  return result;
}
