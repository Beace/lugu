import { BaseInput } from "@artus/pipeline";

export interface ParamMetadata<T = any> {
  name: T;
  ordinalIndex: number;
  key?: string; // @Body(decoratorKey) body
  handler?: string | symbol;
}


export abstract class NPMBookMiddleware {
  /* istanbul ignore next  */
  public abstract use(...args: any): void;
}


export type MiddlewareConstructable = new (...args) => NPMBookMiddleware;

export type NextFunction = () => Promise<void>;

export interface ApplicationPlugin {
  enable?: boolean;
  path?: string;
  package?: string;
}

export interface ApplicationConfig {
  middleware?: MiddlewareConstructable[];
  plugin?: Record<string, ApplicationPlugin>;
  [key: string]: any;
}


export interface Request {
  header: Record<string, any>;
  body: any;
}

export interface Response {
  [key: string | symbol]: any;
}

export interface I extends Input {
  req: any
}


export interface Input extends BaseInput {
  req: Request;
  res: Response;
}
export interface Output extends BaseInput {
  data: any;
}

export interface ParamMetadata<T = any> {
  name: T;
  ordinalIndex: number;
  key?: string;
  handler?: string | symbol;
}

export interface NPMBookLoggerType  {
  level: string
}

export interface ApplicationOptions {
  root?: string;
  name?: string;
  configDir?: string;
  exclude?: string[];
  logger?: NPMBookLoggerType;
}