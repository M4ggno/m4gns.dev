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

/** Gestos que podem conceder permissão de sensores no iOS — o primeiro dispara o pedido. */
const GYRO_GESTURES = ['pointerdown', 'touchend', 'click'] as const;

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
  private gyroAsked = false;
  private tiltOrigin?: { beta: number; gamma: number };

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

    // iOS 13+ exige gesto do usuário para habilitar os sensores de movimento.
    // Ouvimos vários tipos de gesto (o primeiro que chegar dispara o pedido):
    // no iOS o `pointerdown` nem sempre é aceito como gesto válido.
    const DOE = OrbitalSceneHelpers.deviceOrientationEvent;
    if (DOE?.requestPermission) {
      for (const type of GYRO_GESTURES) {
        window.addEventListener(type, this.requestGyro, { once: true, capture: true });
      }
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

    // Calibra na primeira leitura: o "repouso" é como o usuário segura o
    // aparelho, não a mesa. Sem isso, segurar o celular em pé (~beta 90°)
    // já saturava o clamp e o giroscópio parecia morto no iOS.
    if (this.tiltOrigin === undefined) {
      this.tiltOrigin = { beta: event.beta, gamma: event.gamma };
      return;
    }

    const beta = OrbitalSceneHelpers.clamp((event.beta - this.tiltOrigin.beta) / 30, -1, 1);
    const gamma = OrbitalSceneHelpers.clamp((event.gamma - this.tiltOrigin.gamma) / 30, -1, 1);
    this.scene?.setTilt(beta, gamma);
  };

  private readonly requestGyro = (): void => {
    const DOE = OrbitalSceneHelpers.deviceOrientationEvent;
    if (!DOE?.requestPermission || this.gyroAsked) return;
    this.gyroAsked = true;

    // Remove os demais gestos e já deixa o listener pronto: assim que a
    // permissão for concedida, os eventos passam a alimentar a cena.
    for (const type of GYRO_GESTURES) {
      window.removeEventListener(type, this.requestGyro, true);
    }
    window.addEventListener('deviceorientation', this.onOrientation, true);

    DOE.requestPermission()
      .then((state) => {
        if (state !== 'granted') window.removeEventListener('deviceorientation', this.onOrientation, true);
      })
      .catch(() => window.removeEventListener('deviceorientation', this.onOrientation, true));
  };

  private teardownInteraction(): void {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('blur', this.onPointerReset);
    window.removeEventListener('deviceorientation', this.onOrientation, true);
    for (const type of GYRO_GESTURES) {
      window.removeEventListener(type, this.requestGyro, true);
    }
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