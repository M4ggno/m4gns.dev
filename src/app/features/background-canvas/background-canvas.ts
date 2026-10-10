import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { AttackModeService } from '@core/security/attack-mode.service';
import { OrbitalScene } from '@core/three/orbital-scene';

/**
 * Hospeda o <canvas> fullscreen da cena orbital.
 * Responsabilidade única: ciclo de vida + encaminhamento de eventos.
 * Aqui também nascem as interações de fundo: parallax de ponteiro (mouse/toque)
 * e tilt do giroscópio do celular — ambos convertidos em offsets suaves na cena.
 */
@Component({
  selector: 'app-background-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'onResize()' },
  template: `
    <canvas #canvas class="fixed inset-0 z-0 h-full w-full pointer-events-none" aria-hidden="true"></canvas>

    <!-- Overlay de scanlines: leitura de "terminal" sem custo de GPU -->
    <div
      class="fixed inset-0 z-[1] pointer-events-none opacity-[0.025]"
      aria-hidden="true"
      style="background: repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,0.5) 2px 3px);"
    ></div>
  `,
})
export class BackgroundCanvasComponent {
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly attackMode = inject(AttackModeService);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  private scene?: OrbitalScene;

  constructor() {
    afterNextRender(() => this.init());

    // Modo de proteção: congela a GPU para manter a janela utilizável.
    effect(() => {
      if (!this.scene) return;
      if (this.attackMode.active()) this.scene.stop();
      else this.scene.start();
    });

    // Aba oculta => sem render. Economia de bateria/CPU.
    document.addEventListener('visibilitychange', () => {
      if (!this.scene) return;
      if (document.hidden) this.scene.stop();
      else if (!this.attackMode.active()) this.scene.start();
    });

    this.destroyRef.onDestroy(() => this.scene?.dispose());
  }

  onResize(): void {
    if (!this.scene) return;
    this.ngZone.runOutsideAngular(() => this.scene?.resize());
  }

  private init(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    this.ngZone.runOutsideAngular(() => {
      if (!this.supportsWebGl()) return;
      this.scene = new OrbitalScene(canvas);

      // Preferência por menos movimento: renderiza um único frame estático.
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

      this.wireInteraction();
      if (!this.attackMode.active()) this.scene.start();
    });
  }

  // -------------------------------------------------------------------------
  // Interação de fundo: parallax do ponteiro + giroscópio
  // -------------------------------------------------------------------------
  private wireInteraction(): void {
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('blur', this.onPointerReset);

    // iOS 13+ exige gesto do usuário para sensores de movimento: pede no
    // primeiro toque. Android/desktop seguem direto.
    const DOE = OrbitalSceneHelpers.deviceOrientationEvent;
    if (DOE?.requestPermission) {
      window.addEventListener('pointerdown', this.requestGyro, { once: true });
    } else {
      window.addEventListener('deviceorientation', this.onOrientation, true);
    }

    this.destroyRef.onDestroy(() => this.teardownInteraction());
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const nx = (event.clientX / window.innerWidth) * 2 - 1;
    const ny = (event.clientY / window.innerHeight) * 2 - 1;
    this.scene?.setPointer(nx, ny);
  };

  private readonly onPointerReset = (): void => this.scene?.clearPointer();

  private readonly onOrientation = (event: DeviceOrientationEvent): void => {
    if (event.beta == null || event.gamma == null) return;
    const beta = OrbitalSceneHelpers.clamp(event.beta / 75, -1, 1);
    const gamma = OrbitalSceneHelpers.clamp(event.gamma / 60, -1, 1);
    this.scene?.setTilt(beta, gamma);
  };

  private readonly requestGyro = async (): Promise<void> => {
    const DOE = OrbitalSceneHelpers.deviceOrientationEvent;
    if (!DOE?.requestPermission) return;
    try {
      const state = await DOE.requestPermission();
      if (state === 'granted') window.addEventListener('deviceorientation', this.onOrientation, true);
    } catch {
      // permissão negada — seguimos só com parallax de ponteiro
    }
  };

  private teardownInteraction(): void {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('blur', this.onPointerReset);
    window.removeEventListener('deviceorientation', this.onOrientation, true);
    window.removeEventListener('pointerdown', this.requestGyro);
  }

  private supportsWebGl(): boolean {
    try {
      return !!document.createElement('canvas').getContext('webgl2');
    } catch {
      return false;
    }
  }
}

/** Helpers isolados para não poluir a tipagem do componente. */
namespace OrbitalSceneHelpers {
  export const clamp = (value: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, value));

  type DeviceOrientationEventCtor = typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<string>;
  };

  export const deviceOrientationEvent: DeviceOrientationEventCtor | undefined =
    typeof window !== 'undefined'
      ? (window.DeviceOrientationEvent as DeviceOrientationEventCtor)
      : undefined;
}