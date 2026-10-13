import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject, viewChild } from '@angular/core';
import { SectionHeadingComponent } from '@shared/ui/section-heading';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { SITE } from '@core/site.config';

/**
 * Contato — terminal de comunicação criptografada.
 *
 * Funil: e-mail (primário) e Instagram (secundário). Zero formulário, zero
 * serverless: a conversa começa num canal confiável, com assunto sugerido
 * para facilitar o escopo no primeiro contato.
 */
@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeadingComponent, RevealDirective],
  template: `
    <section id="contact" class="relative z-10 w-full border-t border-white/10 px-5 py-24 md:px-16 lg:px-24 md:py-32">
      <div class="mx-auto w-full max-w-7xl">
        <app-section-heading
          appReveal
          index="05"
          label="CONTATO"
          title="Estabelecer"
          accent="ligação direta."
          description="Canal criptografado até a resposta. Sem formulário, sem cadastro, sem robô de atendimento."
        />

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <!-- Painel: registro de transmissão (terminal) -->
          <div class="lg:col-span-7">
            <div appReveal class="overflow-hidden rounded-lg border border-white/10 bg-[#080808]">
              <div class="flex items-center justify-between border-b border-white/10 bg-[#0a0a0a] px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <span class="h-3 w-3 rounded-full bg-red-500/50"></span>
                  <span class="h-3 w-3 rounded-full bg-amber-500/50"></span>
                  <span class="h-3 w-3 rounded-full bg-emerald-500/50"></span>
                  <span class="ml-2 font-mono text-xs text-[#666666]">secure_uplink -- {{ SITE.domain }}</span>
                </div>
                <div class="flex items-center gap-3 font-mono text-[10px] text-[#666666]">
                  <span id="terminal-time">--:--:-- UTC</span>
                  <span class="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 tracking-wider text-emerald-400">LINK OK</span>
                </div>
              </div>

              <div
                #terminalLog
                class="moz-scrollbar h-[360px] overflow-y-auto bg-[#070707] p-4 font-mono text-[13px] leading-relaxed md:h-[430px] md:p-5"
                style="font-family: 'JetBrains Mono', ui-monospace, monospace"
                aria-live="polite"
              >
                <div class="space-y-1.5" #logBody></div>
              </div>

              <div class="flex items-center gap-2 border-t border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-sm">
                <span class="text-emerald-400">guest@m4gns.dev:~$</span>
                <span class="text-[#A3A3A3]">_ aguardando comando de contato</span>
              </div>
            </div>
          </div>

          <!-- Painel: protocolos de contato -->
          <div class="space-y-5 lg:col-span-5">
            <!-- Primário: e-mail -->
            <article appReveal class="group border border-white/10 bg-[#080808] p-6 transition-colors hover:border-[#10B981]/50 md:p-7">
              <div class="mb-4 flex items-center gap-3 font-mono text-xs">
                <span class="tracking-[0.3em] text-emerald-400">PROTOCOLO_01</span>
                <span class="h-1 w-1 rounded-full bg-emerald-400"></span>
                <span class="text-[#666666]">PRIMÁRIO // CANAL OFICIAL</span>
              </div>
              <h3 class="font-display text-xl font-light tracking-tight text-white md:text-2xl">E-mail</h3>
              <p class="mt-3 text-sm leading-relaxed text-[#8A8A8A]">
                Resposta em {{ SITE.responseTime }}. Uso o assunto sugerido para já responder com escopo e orçamento — não perca esse primeiro contato.
              </p>
              <a
                [href]="mailtoHref"
                class="mt-6 flex w-full items-center justify-between gap-4 bg-white px-5 py-3.5 font-mono text-xs font-semibold tracking-widest text-black transition-all hover:bg-white/85"
              >
                <span>{{ SITE.email.address }}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </article>

            <!-- Secundário: Instagram -->
            <article appReveal [appRevealDelay]="0.1" class="group border border-white/10 bg-[#080808] p-6 transition-colors hover:border-[#F59E0B]/50 md:p-7">
              <div class="mb-4 flex items-center gap-3 font-mono text-xs">
                <span class="tracking-[0.3em] text-amber-400">PROTOCOLO_02</span>
                <span class="h-1 w-1 rounded-full bg-amber-400"></span>
                <span class="text-[#666666]">SECUNDÁRIO // PROVA SOCIAL</span>
              </div>
              <h3 class="font-display text-xl font-light tracking-tight text-white md:text-2xl">Instagram profissional</h3>
              <p class="mt-3 text-sm leading-relaxed text-[#8A8A8A]">
                Processo de trabalho em público: raciocínio, erros, refatorações e resultado. Melhor pré-venda do que qualquer pitch.
              </p>
              <a
                [href]="SITE.social.instagram.url"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-6 flex w-full items-center justify-between gap-4 border border-white/15 px-5 py-3.5 font-mono text-xs tracking-widest text-white transition-colors hover:border-amber-400 hover:text-amber-300"
              >
                <span>{{ SITE.social.instagram.handle }}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </article>

            <!-- Arquivo: GitHub -->
            <article appReveal [appRevealDelay]="0.2" class="group border border-white/10 bg-[#080808] p-6 transition-colors hover:border-white/40 md:p-7">
              <div class="mb-4 flex items-center gap-3 font-mono text-xs">
                <span class="tracking-[0.3em] text-[#8A8A8A]">PROTOCOLO_03</span>
                <span class="h-1 w-1 rounded-full bg-[#8A8A8A]"></span>
                <span class="text-[#666666]">ARQUIVO // CÓDIGO-FONTE</span>
              </div>
              <h3 class="font-display text-xl font-light tracking-tight text-white md:text-2xl">Repositório</h3>
              <p class="mt-3 text-sm leading-relaxed text-[#8A8A8A]">
                Código público por princípio. Auditoria de histórico antes de contratar, não depois.
              </p>
              <a
                [href]="SITE.social.github.url"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-6 flex w-full items-center justify-between gap-4 border border-white/15 px-5 py-3.5 font-mono text-xs tracking-widest text-white transition-colors hover:border-white/70 hover:bg-white/5"
              >
                <span>{{ SITE.social.github.handle }}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </article>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {
  protected readonly SITE = SITE;
  protected readonly mailtoHref = `mailto:${SITE.email.address}?subject=${encodeURIComponent(SITE.email.subject)}`;

  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private readonly terminalLog = viewChild<ElementRef<HTMLElement>>('terminalLog');
  private readonly logBody = viewChild<ElementRef<HTMLElement>>('logBody');

  /** Registro de transmissão — factual, seco, comprovável. */
  private readonly logLines = [
    '[BOOT] m4gns.dev — build estático, zero serverless.',
    '[TLS] handshake ok :: TLS_AES_256_GCM_SHA384',
    '[HSTS] preload confirmado :: max-age=63072000',
    '[CSP] frame-ancestors \'none\' :: object-src \'none\'',
    '[WAF] Vercel Firewall :: rate limit 100r/10s por IP',
    '[DNS] m4gns.dev -> 76.76.21.21 (sao paulo)',
    '[MAIL] contato@m4gns.dev :: DKIM 2048b + DMARC reject',
    '[SPF] include:_spf.google.com ~all',
    '[SSL] renovação automática :: Let\'s Encrypt',
    '[CACHE] assets imutáveis :: 1 ano :: brotli',
    '[WDGT] LENIS 60FPS :: ANIMAÇÃO FORA DA NGZONE',
    '[AVAILABILITY] inicio de conversa em @m4gns.dev',
    '[UPLINK] aguardando seu primeiro sinal...',
  ];

  constructor() {
    afterNextRender(() => {
      this.ngZone.runOutsideAngular(() => {
        this.startTerminal();
        this.startClock();
      });
    });
  }

  private startTerminal(): void {
    const body = this.logBody()?.nativeElement;
    const container = this.terminalLog()?.nativeElement;
    if (!body || !container) return;

    const typeLine = (index: number, resolve: () => void) => {
      const line = this.logLines[index];
      const row = document.createElement('div');
      row.className = 'flex gap-2';
      body.appendChild(row);

      const stamp = document.createElement('span');
      stamp.className = 'shrink-0 text-[#444444]';
      stamp.textContent = this.stamp();
      const content = document.createElement('span');
      content.className = 'text-[#A3A3A3]';
      row.append(stamp, content);

      let cursor = 0;
      const typeChar = () => {
        if (cursor < line.length) {
          content.textContent += line[cursor++];
          setTimeout(typeChar, 14 + Math.random() * 26);
        } else {
          container!.scrollTop = container!.scrollHeight;
          resolve();
        }
      };
      typeChar();
    };

    const run = (index: number) => {
      if (index >= this.logLines.length) {
        setTimeout(() => {
          body.innerHTML = '';
          run(0);
        }, 4_000);
        return;
      }
      typeLine(index, () => setTimeout(() => run(index + 1), 160 + Math.random() * 320));
    };

    setTimeout(() => run(0), 600);
  }

  private startClock(): void {
    const el = document.getElementById('terminal-time');
    if (!el) return;

    const tick = () => {
      el.textContent = new Date().toISOString().slice(11, 19) + ' UTC';
    };
    tick();
    const interval = setInterval(tick, 1_000);
    this.destroyRef.onDestroy(() => clearInterval(interval));
  }

  private stamp(): string {
    return `[${new Date().toISOString().slice(11, 23)}]`;
  }
}