import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  effect,
  inject,
  signal,
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

    <!-- iOS exige gesto explícito para os sensores: botão dedicado = gesto válido + feedback -->
    @if (motionHint() && !motionGranted()) {
      <button
        type="button"
        (click)="requestGyro()"
        class="fixed bottom-4 left-4 z-40 flex items-center gap-2 border border-white/20 bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[#A3A3A3] backdrop-blur-md transition-colors hover:border-white/50 hover:text-white"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
        Ativar movimento
      </button>
    }
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

  /** Exibe o botão de ativar movimento enquanto a permissão ainda não foi dada. */
  protected readonly motionHint = signal(false);
  protected readonly motionGranted = signal(false);

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

    // Sempre escutamos os sensores; no iOS o evento só passa a virar depois da
    // permissão concedida. Atenção: pedimos a permissão em um gesto (o prompt
    // exige gesto do usuário) — ouvimos vários tipos porque o iOS nem sempre
    // aceita `pointerdown` como gesto válido.
    window.addEventListener('deviceorientation', this.onOrientation, true);

    const DOE = OrbitalSceneHelpers.deviceOrientationEvent;
    if (DOE?.requestPermission) {
      for (const type of GYRO_GESTURES) {
        window.addEventListener(type, this.requestGyro, { once: true, capture: true });
      }
      this.motionHint.set(true); // botão dedicado = gesto garantido + feedback
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

  protected readonly requestGyro = (): void => {
    const DOE = OrbitalSceneHelpers.deviceOrientationEvent;
    if (!DOE?.requestPermission || this.gyroAsked) return;
    this.gyroAsked = true;

    // O listener de `deviceorientation` já está sempre registrado; aqui só
    // pedimos a permissão e paramos de ouvir os gestos (evita repetir o pedido).
    for (const type of GYRO_GESTURES) {
      window.removeEventListener(type, this.requestGyro, true);
    }

    DOE.requestPermission()
      .then((state) => {
        if (state === 'granted') {
          this.motionGranted.set(true);
          this.motionHint.set(false);
        } else {
          // Não concedido: libera nova tentativa (o botão segue visível).
          this.gyroAsked = false;
        }
      })
      .catch(() => {
        this.gyroAsked = false;
      });
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