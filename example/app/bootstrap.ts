import path from 'path';
import { NPMBookApplication } from '@npm-book/application';


async function main() {
  const app = await NPMBookApplication.start({
    root: path.resolve(__dirname, '.'),
    configDir: 'config',
    exclude: [],
  });

  return app;
}

if (require.main === module) {
  main();
}
