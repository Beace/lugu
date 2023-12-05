import { InjectHandler } from '@artus/core/injection';

export const CONFIG_ID = 'config';

export function Config();
export function Config(id: string);
export function Config(id?: string) {
  return InjectHandler(CONFIG_ID, id || CONFIG_ID);
}
