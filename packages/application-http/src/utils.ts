import { getParamMetadata, getParamValues } from "@npm-book/application";


export function getMiddlewareInstance(npmBookMiddlewares: any[]) {
  return npmBookMiddlewares.map(middlewareItem => {
    let middlewareClass = middlewareItem;
    if (Array.isArray(middlewareItem)) {
      [middlewareClass] = middlewareItem;
    }
    const paramMetadataList = getParamMetadata(middlewareClass.prototype, 'use');
    return async (koaCtx: any, next: Function) => {
      const paramInstances = getParamValues(koaCtx.triggerCtx, {
        nextFn: next,
        ...paramMetadataList,
      });
      const { triggerCtx } = koaCtx;
      const npmBookMiddleware = (triggerCtx as any).container.get(middlewareClass);
      await npmBookMiddleware.use(...paramInstances);
    };
  });
}

export function isPlainObject(value) {
  return value && !Array.isArray(value) && typeof value === 'object';
}

export function isObject(value) {
  return typeof value === 'object';
}