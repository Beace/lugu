import { existsSync } from 'fs';
import path from 'path';
import { ArtusApplication, Manifest, ArtusScanner, LoggerType } from '@artus/core';
import MyTrigger from './trigger';
import { DEFAULT_EXCLUDE_FILES, DEFAULT_EXTENSIONS, transformMiddleware } from './utils';
import { MiddlewareConstructable, ApplicationOptions } from './types';
import { NPMBookLogger } from './logger';

export class NPMBookApplication extends ArtusApplication {
  public manifest: Manifest;
  public options: ApplicationOptions;
  public env: string;
  public middlewares: any[] = [];
  private _logger: NPMBookLogger;


  constructor(options: ApplicationOptions = {
    root: process.cwd(),
    name: 'app',
    configDir: 'config',
    exclude: [],
  }) {
    super();
    this.options = options;
    this.env = process.env.ARTUS_SERVER_ENV ?? 'default';
    this._logger = new NPMBookLogger(options.logger);
    this.container.set({ id: NPMBookLogger, value: this._logger });
    this._init();
  }

  public get trigger(): MyTrigger {
    return this.container.get(MyTrigger);
  }

  public get config() {
    return super.config;
  }

  public override get logger(): LoggerType {
    return this._logger as LoggerType;
  }

  private _init() {
    this.registerHook('configDidLoad', () => {
      this.container.registerHandler(
        'config',
        key => key === 'config' ? this.config : this.config[key]
      );
    });
  }

  public static async start(options?: ApplicationOptions) {
    const app = new NPMBookApplication(options);
    const manifestMap = await app.scan();
    await app.load(manifestMap, app.options.root);
    await app.run();
    return app;
  }

  public async load(manifest: Manifest, root?: string) {
    await super.load(manifest as Manifest, root ?? this.options.root);
    return this;
  }

  public async scan() {
    const manifestFilePath = path.resolve(this.options.root!, 'manifest.json');
    if (existsSync(manifestFilePath)) {
      return require(manifestFilePath);
    }

    const scanner = new ArtusScanner({
      configDir: this.options.configDir,
      needWriteFile: false,
      useRelativePath: true,
      extensions: DEFAULT_EXTENSIONS,
      exclude: this.options.exclude?.concat(DEFAULT_EXCLUDE_FILES),
      app: this,
    });
    return await scanner.scan(this.options.root!);
  }

  public async run() {
    await this.lifecycleManager.emitHook('createServer');
    await this.lifecycleManager.emitHook('willReady');
    await this.lifecycleManager.emitHook('initServer');
    await this.lifecycleManager.emitHook('beforeStartServer');
    await this.lifecycleManager.emitHook('startServer');
    await this.lifecycleManager.emitHook('didReady');
  }

  public loadDefaultClass(): void {
    super.loadDefaultClass()
    this.container.set({
      id: NPMBookApplication,
      value: this,
    });
    this.container.set({
      type: MyTrigger,
    });
  }

  public use(...middlewares: MiddlewareConstructable[]) {
    this.useMiddleware(middlewares);
  }

  private useMiddleware(middlewares: MiddlewareConstructable[]) {
    for (const mClazz of middlewares) {
      this.middlewares.push(mClazz);
      this.trigger.use(transformMiddleware(mClazz));
    }
  }
}
