import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

/**
 * Configuração de servidor — usada SOMENTE no prerender (SSG) do build.
 *
 * Não existe runtime de servidor: com `outputMode: "static"` o Angular
 * congela o HTML renderizado e o deploy continua 100% estático na Vercel.
 * O objetivo é que crawlers sem JavaScript (GPTBot, PerplexityBot, ClaudeBot)
 * recebam o conteúdo no HTML cru em vez de um <app-root> vazio.
 */
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
