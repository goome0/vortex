/**
 * Tipo auxiliar para criar o tipo de retorno após mapeamento de campos
 */
type MapFieldsResult<T extends Record<string, any>, M extends Partial<Record<keyof T, string>>> = Omit<T, keyof M> & {
  [K in keyof M as M[K] extends string ? M[K] : never]: K extends keyof T ? T[K] : never;
};

/**
 * Mapeia e renomeia campos de um objeto ou array de objetos de forma type-safe
 *
 * @template T - Tipo do objeto de entrada
 * @template M - Tipo do mapeamento de campos (ex: { oldField: 'newField' })
 *
 * @example
 * // Renomear campos de um objeto
 * const user = { id: 1, firstName: 'John', lastName: 'Doe' };
 * const mapped = mapFields(user, { firstName: 'name', lastName: 'surname' });
 * // Resultado: { id: 1, name: 'John', surname: 'Doe' }
 *
 * @example
 * // Renomear campos de um array
 * const users = [
 *   { id: 1, firstName: 'John' },
 *   { id: 2, firstName: 'Jane' }
 * ];
 * const mapped = mapFields(users, { firstName: 'name' });
 * // Resultado: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
 *
 * @example
 * // Selecionar apenas campos específicos e renomeá-los
 * const order = { id: 1, total: 100, status: 'pending', createdAt: '2024-01-01' };
 * const mapped = mapFields(order, { total: 'amount', status: 'orderStatus' });
 * // Resultado: { id: 1, amount: 100, orderStatus: 'pending', createdAt: '2024-01-01' }
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
 * Tipo auxiliar para criar o tipo de retorno após mapeamento de campos selecionados
 */
type MapSelectedFieldsResult<T extends Record<string, any>, M extends Partial<Record<keyof T, string>>> = {
  [K in keyof M as M[K] extends string ? M[K] : never]: K extends keyof T ? T[K] : never;
};

/**
 * Mapeia campos selecionando apenas os campos especificados e renomeando-os
 *
 * @template T - Tipo do objeto de entrada
 * @template M - Tipo do mapeamento de campos
 *
 * @example
 * const order = { id: 1, total: 100, status: 'pending', createdAt: '2024-01-01' };
 * const mapped = mapSelectedFields(order, { total: 'amount', status: 'orderStatus' });
 * // Resultado: { amount: 100, orderStatus: 'pending' } (apenas os campos mapeados)
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
