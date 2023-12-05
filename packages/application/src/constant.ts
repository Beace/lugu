export const METADATA_PARAM_DECORATORS = 'metadata_param_decorators';
export const REFLECT_DESIGN_PARAM_TYPES = 'design:paramtypes';

export enum ParamDecoratorType {
  NEXT = 'next',
  RES = 'res',
  REQ = 'req',
  HEADER = 'header',
  BODY = 'body',
  QUERY = 'query',
  QUERY_STRING = 'querystring',
  PARAM = 'params',
  HOST = 'host',
  HREF = 'href',
  SEARCH = 'search',
  COOKIE = 'cookies',
  FILES = 'files',
}

export const TRIGGER_CTX = Symbol.for('trigger_context');