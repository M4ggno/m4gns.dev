import { Injectable, signal } from '@angular/core';

/**
 * Autodefesa client-side.
 *
 * Observa telemetria do próprio navegador (falhas em rajada de sub-recursos e
 * alternância frenética de visibilidade — sinal comum de automação) e, ao
 * estourar o limiar, entra em "modo de proteção": o site congela animações
 * pesadas para manter o navegador utilizável.
 *
 * NÃO substitui a proteção de borda (Vercel Firewall / rate limiting). Esta
 * camada existe apenas para evitar que um visitante derrube a própria
 * janela quando algo estiver errado.
 */
@Injectable({ providedIn: 'root' })
export class AttackModeService {
  readonly active = signal(false);

  private failures: number[] = [];
  private visibilityToggles = 0;
  private visibilityWindowStart = 0;

  private static readonly WINDOW_MS = 10_000;
  private static readonly FAILURE_THRESHOLD = 15;
  private static readonly VISIBILITY_WINDOW_MS = 30_000;
  private static readonly VISIBILITY_THRESHOLD = 20;

  constructor() {
    if (typeof window === 'undefined') return;

    this.watchResourceFailures();
    this.watchVisibilityFlicker();
  }

  /** Desativa manualmente (botão do banner). */
  recover(): void {
    this.active.set(false);
    this.failures = [];
    this.visibilityToggles = 0;
  }

  /** Dispara sem as condições (usado em testes / watchdog manual). */
  force(): void {
    this.active.set(true);
  }

  private watchResourceFailures(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const status = (entry as PerformanceResourceTiming).responseStatus;
          // 0 = requisição bloqueada/desconectada; >= 400 = erro servidor
          if (status === 0 || status >= 400) this.strike();
        }
      });
      observer.observe({ type: 'resource', buffered: false });
    } catch {
      // navegador sem suporte a entry de resource — seguimos sem esse gatilho
    }
  }

  private watchVisibilityFlicker(): void {
    document.addEventListener('visibilitychange', () => {
      const now = Date.now();
      if (now - this.visibilityWindowStart > AttackModeService.VISIBILITY_WINDOW_MS) {
        this.visibilityToggles = 0;
        this.visibilityWindowStart = now;
      }
      this.visibilityToggles += 1;
      if (this.visibilityToggles >= AttackModeService.VISIBILITY_THRESHOLD) this.activate();
    });
  }

  private strike(): void {
    const now = Date.now();
    this.failures.push(now);
    this.failures = this.failures.filter((t) => now - t < AttackModeService.WINDOW_MS);
    if (this.failures.length >= AttackModeService.FAILURE_THRESHOLD) this.activate();
  }

  private activate(): void {
    if (!this.active()) this.active.set(true);
  }
}