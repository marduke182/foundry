import ts from 'gulp-typescript';
import path from 'path';
import { dest, src, TaskFunction } from 'gulp';
import merge from 'merge-stream';
import { createTransformer } from './add-js-extensions-imports-transform';
import { eachModule } from './utils';

export const build: TaskFunction = () => {
  const tasks: NodeJS.ReadableStream[] = [];
  for (const modulePath of eachModule()) {
    const tsConfig = ts.createProject(path.join(modulePath, 'tsconfig.json'), {
      getCustomTransformers: (_) => ({
        after: [createTransformer()],
      }),
    });
    const task = src(path.join(modulePath, 'src/**/*.ts'))
      .pipe(tsConfig())
      .pipe(dest(path.join(modulePath, 'dist/')));
    tasks.push(task);
  }

  return merge(tasks) as NodeJS.ReadableStream;
};
