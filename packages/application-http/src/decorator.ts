import { addTag, Injectable, ScopeEnum } from "@artus/core/injection";

export const ROUTER_METADATA = Symbol.for('ROUTE_METADATA');
export const CONTROLLER_METADATA = Symbol.for('CONTROLLER_METADATA');
export const WEB_CONTROLLER_TAG = 'WEB_CONTROLLER_TAG';

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  HEAD = 'HEAD',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
}

export function Controller(prefix?: string) {
  return (target: any) => {
    const controllerMetadata = {
      prefix,
    };

    Reflect.defineMetadata(CONTROLLER_METADATA, controllerMetadata, target);
    addTag(WEB_CONTROLLER_TAG, target);
    Injectable({ scope: ScopeEnum.EXECUTION })(target);
  }
}

export const GET = httpMethodDecorator(HTTPMethod.GET);
export const POST = httpMethodDecorator(HTTPMethod.POST);
export const PUT = httpMethodDecorator(HTTPMethod.PUT);
export const HEAD = httpMethodDecorator(HTTPMethod.HEAD);
export const DELETE = httpMethodDecorator(HTTPMethod.DELETE);
export const OPTIONS = httpMethodDecorator(HTTPMethod.OPTIONS);
export const PATCH = httpMethodDecorator(HTTPMethod.PATCH);

function httpMethodDecorator(method: HTTPMethod) {
  return (path: string) => {
    return (target: object, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
      const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, descriptor.value) ?? [];
      routeMetadataList.push({
        path,
        method,
        key,
      });
      Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value);
      return descriptor;
    }
  }
}