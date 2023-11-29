import { Injectable } from '@artus/core/injection';
import { ScopeEnum } from '@artus/core';

export function Middleware() {
  return Injectable({ scope: ScopeEnum.EXECUTION });
}
