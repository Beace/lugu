import { addTag, Injectable, ScopeEnum } from "@artus/core/injection";
import { isObject, isPlainObject } from "./utils";
import { methodParamDecorator, MiddlewareConstructable, ParamDecoratorType } from "@npm-book/application";
import { PARAM_HANDLER } from "./constant";

export const ROUTER_METADATA = Symbol.for('ROUTE_METADATA');
export const CONTROLLER_METADATA = Symbol.for('CONTROLLER_METADATA');
export const WEB_CONTROLLER_TAG = 'WEB_CONTROLLER_TAG';

export interface WebControllerOptions {
  path?: string;
  host?: string;
  middlewares?: MiddlewareConstructable[];
}

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  HEAD = 'HEAD',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
}

export function Controller(prefix?: string | WebControllerOptions) {
  let path = '';
  let middlewares: MiddlewareConstructable[] = [];

  if (typeof prefix === 'string') {
    path = prefix || '/'
  } else {
    path = prefix?.path || '/';
    middlewares = prefix?.middlewares || [];
  }

  const controllerMetadata = {
    path,
    middlewares,
  };

  return (target: any) => {
    addTag(WEB_CONTROLLER_TAG, target);
    Injectable({ scope: ScopeEnum.EXECUTION })(target);
    Reflect.defineMetadata(CONTROLLER_METADATA, controllerMetadata, target);
  }
}

export const GET = httpMethodDecorator(HTTPMethod.GET);
export const POST = httpMethodDecorator(HTTPMethod.POST);
export const PUT = httpMethodDecorator(HTTPMethod.PUT);
export const HEAD = httpMethodDecorator(HTTPMethod.HEAD);
export const DELETE = httpMethodDecorator(HTTPMethod.DELETE);
export const OPTIONS = httpMethodDecorator(HTTPMethod.OPTIONS);
export const PATCH = httpMethodDecorator(HTTPMethod.PATCH);

export interface MethodDecoratorOptions {
  middlewares: MiddlewareConstructable[]
}

function httpMethodDecorator(method: HTTPMethod) {
  return (path?: string, options?: MethodDecoratorOptions) => {
    const [middlewares] = options && isPlainObject(options) ? [options.middlewares || []] : [[]];
    return (target: object, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
      if (isObject(target)) {
        target = target.constructor;
      }
      const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, target) ?? [];
      routeMetadataList.push({
        path,
        method,
        key,
        middlewares,
      });
      Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, target);
      return descriptor;
    }
  }
}



/**
 * param decorators
 */
// export { Next, Req, Res, Header, Body };

export const Query = methodParamDecorator(ParamDecoratorType.QUERY, PARAM_HANDLER);
export const Param = methodParamDecorator(ParamDecoratorType.PARAM, PARAM_HANDLER);
export const Files = methodParamDecorator(ParamDecoratorType.FILES, PARAM_HANDLER);

export const Querystring = () => methodParamDecorator(ParamDecoratorType.QUERY_STRING, PARAM_HANDLER)();
export const Host = () => methodParamDecorator(ParamDecoratorType.HOST, PARAM_HANDLER)();
export const Href = () => methodParamDecorator(ParamDecoratorType.HREF, PARAM_HANDLER)();
export const Search = () => methodParamDecorator(ParamDecoratorType.SEARCH, PARAM_HANDLER)();
export const Cookie = () => methodParamDecorator(ParamDecoratorType.COOKIE, PARAM_HANDLER)();
