import { Middleware } from "@artus/pipeline";
import { ParamMetadata } from "./types";
import { METADATA_PARAM_DECORATORS, REFLECT_DESIGN_PARAM_TYPES } from "./constant";

export function transformMiddleware(mClazz: any): Middleware {
  const metadataList = getParamMetadata(mClazz.prototype, 'use');

  return async (ctx, next) => {
    const npmBookMiddleware = ctx.container.get(mClazz);
    const paramValues = getParamValues(ctx, { nextFn: next, ...metadataList });
    return npmBookMiddleware.use(...paramValues);
  };
}


export function getParamValues(ctx: any, opts: any): any[] {
  const { paramDesignMetadataList, paramMetadataList, nextFn } = opts;
  if (!paramDesignMetadataList || !paramDesignMetadataList.length) {
    return [];
  }

  return paramDesignMetadataList.map((_, index) => {
    const paramMetadata: ParamMetadata<any> | undefined = paramMetadataList.find(one => one.ordinalIndex === index);
    if (!paramMetadata || paramMetadata.name === 'next') {
      return nextFn;
    }
    let value;
    if (paramMetadata.handler) {
      const handler = ctx.container.getHandler(paramMetadata.handler as any);
      if (!handler) {
        throw new Error(`"${handler}" param handler was not found`);
      }
      value = handler(paramMetadata.name, paramMetadata.key);
    } else {
      value = ctx.container.get(paramMetadata.name);
      if (paramMetadata.key) {
        value = value[paramMetadata.key];
      }
    }
    return value;
  });
}


export function getParamMetadata(target: object, propertyName: string) {
  const paramMetadataList = getParamCustomMetadata(target, propertyName);
  const paramDesignMetadataList = getParamDesignMetadata(target, propertyName);
  return { paramMetadataList, paramDesignMetadataList };
}

export function getParamCustomMetadata(target: object, propertyName: string): ParamMetadata<any>[] {
  const paramMetadataList: ParamMetadata[] = Reflect.getOwnMetadata(METADATA_PARAM_DECORATORS, target, propertyName);
  return paramMetadataList ?? [];
}

export function getParamDesignMetadata(target: any, property?: string | symbol) {
  if (property) {
    return Reflect.getOwnMetadata(REFLECT_DESIGN_PARAM_TYPES, target, property);
  }
  /* istanbul ignore next */
  return Reflect.getOwnMetadata(REFLECT_DESIGN_PARAM_TYPES, target);
}

export const DEFAULT_EXCLUDE_FILES = ['yarn.lock', 'pnpm-lock.yaml', 'package-lock.json', 'test'];
export const DEFAULT_EXTENSIONS = ['.js', '.json', '.node', '.ts'];
