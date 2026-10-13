import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

/** Entry-point de servidor usado apenas durante o prerender (SSG). */
const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, config, context);

export default bootstrap;