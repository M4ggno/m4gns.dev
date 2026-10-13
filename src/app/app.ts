import { Component, effect, inject } from '@angular/core';
import { BackgroundCanvasComponent } from './features/background-canvas/background-canvas';
import { HeroComponent } from './features/hero/hero';
import { ServicesComponent } from './features/services/services';
import { StackComponent } from './features/stack/stack';
import { WorkComponent } from './features/work/work';
import { FaqComponent } from './features/faq/faq';
import { ContactComponent } from './features/contact/contact';
import { FooterComponent } from './features/footer/footer';
import { AttackModeService } from './core/security/attack-mode.service';
import { MotionService } from './core/motion/motion.service';

/**
 * Shell da aplicação — composição das features na ordem do funil de conversão.
 * Não decide nada: apenas monta as seções e concilia os serviços transversais
 * (modo de proteção ⇄ movimento da página).
 */
@Component({
  selector: 'app-root',
  imports: [
    BackgroundCanvasComponent,
    HeroComponent,
    ServicesComponent,
    StackComponent,
    WorkComponent,
    FaqComponent,
    ContactComponent,
    FooterComponent,
  ],
  template: `
    <!-- Cena orbital 3D ao fundo (z-0, ignora ponteiro) -->
    <app-background-canvas />

    <!-- Conteúdo na frente (z-10) -->
    <div class="relative z-10 flex min-h-screen w-full flex-col overflow-x-hidden">
      <app-hero />
      <app-services />
      <app-stack />
      <app-work />
      <app-faq />
      <app-contact />
      <app-footer />
    </div>

    <!-- Aviso do modo de proteção (ativado por heurística client-side) -->
    @if (attackMode.active()) {
      <div class="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 border border-amber-500/40 bg-[#111] px-5 py-3 font-mono text-xs tracking-widest text-amber-200 backdrop-blur-md">
        MODO DE PROTEÇÃO ATIVO — animações suspensas para estabilidade do navegador.
        <button class="ml-4 underline underline-offset-4" (click)="attackMode.recover()">RETOMAR</button>
      </div>
    }
  `,
})
export class App {
  readonly attackMode = inject(AttackModeService);
  private readonly motion = inject(MotionService);

  constructor() {
    // Congela/reanima a página inteira (scroll suave + ticker do GSAP) sob o
    // estado do modo de proteção.
    effect(() => {
      if (this.attackMode.active()) this.motion.pause();
      else this.motion.resume();
    });
  }
}