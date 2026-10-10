import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';

/**
 * Aplicação 100% estática, sem rotas, sem NgModules.
 * Landing page de seção única — o shell monta as features na ordem do funil.
 *
 * Zoneless explícito: toda animação (GSAP/Three/Lenis) roda fora da mudança de
 * detecção; sem zone.js, sem @angular/router. Menos runtime, menos CD disparada.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideZonelessChangeDetection()]
};