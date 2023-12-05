import { ExecutionContainer } from '@artus/core/injection';

import { ParamMetadata } from '../types';
import { ParamDecoratorType, METADATA_PARAM_DECORATORS } from '../constant';


export function methodParamDecorator<T>(name: T, handler?: string | symbol) {
  return (key?: string) =>
    (
      target: object,
      propertyName: string | symbol,
      ordinalIndex: number
    ) => {
      const metaDataList: ParamMetadata<T>[] = Reflect.getMetadata(METADATA_PARAM_DECORATORS, target, propertyName) || [];
      const paramMetadata: ParamMetadata<T> = {
        name,
        handler,
        ordinalIndex,
      };
      key && (paramMetadata.key = key);
      Reflect.defineMetadata(METADATA_PARAM_DECORATORS, metaDataList.concat(paramMetadata), target, propertyName);
    };
}

export const UseContainer = () => methodParamDecorator(ExecutionContainer)();
export const Next = () => methodParamDecorator(ParamDecoratorType.NEXT)();
export const Req = () => methodParamDecorator(ParamDecoratorType.REQ)();
export const Res = () => methodParamDecorator(ParamDecoratorType.RES)();
export const Header = methodParamDecorator(ParamDecoratorType.HEADER);
export const Body = methodParamDecorator(ParamDecoratorType.BODY);
