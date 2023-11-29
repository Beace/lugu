import { ArtusInjectEnum } from '@artus/core';
import { ExecutionContainer, Inject, Injectable, ScopeEnum } from '@artus/core/injection';
import { Middleware, Pipeline, BaseContext } from '@artus/pipeline';
import { NPMBookApplication } from './application';
import { ParamDecoratorType, TRIGGER_CTX } from './constant';
import { Input, Output } from './types';

export class Context<I extends Input = Input, O extends Output = Output> implements BaseContext {
  public input: I;
  public output: O;
  public container: ExecutionContainer;
  constructor(input: I, output: O) {
    this.input = input;
    this.output = output;
  }
}

@Injectable({ scope: ScopeEnum.SINGLETON })
export default class NPMBookTrigger {
  @Inject(ArtusInjectEnum.Application)
  public app: NPMBookApplication;

  protected pipeline: Pipeline;

  constructor() {
    this.pipeline = new Pipeline();
  }

  public use(m: Middleware) {
    this.pipeline.use(m);
  }

  public initContext(input: Input, output: Output) {
    const ctx = new Context<Input, Output>(input, output);
    ctx.container = new ExecutionContainer(ctx, this.app.container);
    ctx.container.set({ id: ExecutionContainer, value: ctx.container });
    ctx.container.set({ id: ParamDecoratorType.REQ, value: ctx.input.req });
    ctx.container.set({ id: ParamDecoratorType.RES, value: ctx.input.res });
    ctx.container.set({ id: ParamDecoratorType.HEADER, value: ctx.input.req.header });
    ctx.container.set({ id: ParamDecoratorType.BODY, value: ctx.input.req.body });
    ctx.container.set({ id: TRIGGER_CTX, value: ctx });

    return ctx;
  }

  public async startPipeline(ctx: Context) {
    await this.pipeline.run(ctx);
  }
}
