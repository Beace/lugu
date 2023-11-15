import { InjectHandler } from '@artus/core/injection';

export function Config();
export function Config(id: string);
export function Config(id?: string) {
  return InjectHandler('config', id || 'config');
}
