import * as THREE from 'three';

/**
 * Cena "Galactic Core / Singularity": infraestrutura orbital como um núcleo
 * galáctico — buraco negro central com anel de fótons, disco de acreção com
 * rotação diferencial (Kepleriana) e braços espirais co-rotantes, halo
 * estelar esférico e apenas 2 anéis orbitais finos + cometas discretos.
 *
 * Propositalmente AUSTERO: quase nenhuma linha/aresta. A riqueza vem do brilho
 * em partículas, não de traços de geometria.
 *
 * Classe pura de Three.js — sem dependência do Angular. O componente apenas
 * hospeda o <canvas>, encaminha resize/visibilidade e chama dispose().
 */
export class OrbitalScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;

  /** Grupo "galáxia": tudo que gira/tilta junto (disco, halo, anéis, cometas). */
  private readonly galaxy = new THREE.Group();
  private readonly rings = new THREE.Group();

  private disk?: THREE.Points;
  private halo?: THREE.Points;
  private auraTexture?: THREE.CanvasTexture;

  private frameId?: number;
  private running = false;
  private disposed = false;
  private elapsed = 0;
  private lastTick = 0;

  /** Parallax de ponteiro (mouse/toque), normalizado em -1..1. */
  private readonly pointerPos = new THREE.Vector2(0, 0);
  /** Tilt do giroscópio (beta, gamma) normalizado em -1..1. */
  private readonly tilt = new THREE.Vector2(0, 0);

  private pointerActive = false;

  // Vetores reutilizáveis de raio → plano do disco (sem GC por frame).
  private readonly ndc = new THREE.Vector3();
  private readonly camDir = new THREE.Vector3();
  private readonly mouseWorld = new THREE.Vector3();
  private readonly mouseLocal = new THREE.Vector3();
  private readonly diskNormal = new THREE.Vector3();

  private readonly diskCount: number;
  private readonly haloCount: number;

  private static readonly BASE_ROT_X = -0.42;
  private static readonly BASE_ROT_Y = 0.55;

  constructor(canvas: HTMLCanvasElement, options: { diskCount?: number; haloCount?: number } = {}) {
    this.diskCount = options.diskCount ?? 9_000;
    this.haloCount = options.haloCount ?? 2_400;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050505, 0.0035);

    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 500);
    this.camera.position.set(0, 5, 27);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.buildEventHorizon();
    this.buildAccretionDisk();
    this.buildStellarHalo();
    this.buildOrbitalRings();
    this.buildComets();

    // Inclinação de apresentação: galáxia vista de ~30° — vira elipse, não átomo.
    this.galaxy.rotation.set(OrbitalScene.BASE_ROT_X, OrbitalScene.BASE_ROT_Y, 0);
    // Escala aproxima o conjunto (câmera mais perto + conjunto maior = presença).
    this.galaxy.scale.setScalar(1.18);
    this.scene.add(this.galaxy);
    this.resize();
  }

  /**
   * Parallax de ponteiro (mouse/toque). Valores normalizados: -1 (canto esq./topo)
   * a +1 (canto dir./base). A câmera e a galáxia inclinam-se em direção ao cursor.
   */
  setPointer(x: number, y: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    this.pointerPos.x = THREE.MathUtils.clamp(x, -1, 1);
    this.pointerPos.y = THREE.MathUtils.clamp(y, -1, 1);
    this.pointerActive = true;
  }

  /** Saiu da janela: o efeito de "empurrão" desliga até o próximo movimento. */
  clearPointer(): void {
    this.pointerActive = false;
    this.pointerPos.set(0, 0);
  }

  /**
   * Tilt do giroscópio do celular (DeviceOrientation): beta = inclinação
   * frente/trás, gamma = inclinação esq./dir. Ambos normalizados em -1..1.
   */
  setTilt(beta: number, gamma: number): void {
    this.tilt.x = THREE.MathUtils.clamp(beta, -1, 1);
    this.tilt.y = THREE.MathUtils.clamp(gamma, -1, 1);
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.lastTick = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.frameId !== undefined) {
      cancelAnimationFrame(this.frameId);
      this.frameId = undefined;
    }
  }

  resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  dispose(): void {
    this.disposed = true;
    this.stop();

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    this.galaxy.traverse((o) => this.collect(o, geometries, materials));
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    this.auraTexture?.dispose();

    this.renderer.dispose();
  }

  private collect(obj: THREE.Object3D, geometries: THREE.BufferGeometry[], materials: THREE.Material[]): void {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) geometries.push(mesh.geometry);
    if (mesh.material) {
      if (Array.isArray(mesh.material)) materials.push(...mesh.material);
      else materials.push(mesh.material);
    }
  }

  // -----------------------------------------------------------------------
  // Camada 1 — Horizonte de eventos + anel de fótons
  // -----------------------------------------------------------------------
  private buildEventHorizon(): void {
    const horizon = new THREE.Mesh(
      new THREE.SphereGeometry(4.5, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    );

    // Anel de fótons: fino, aditivo, colado na sombra — o traço mais brilhante.
    const photonRing = new THREE.Mesh(
      new THREE.TorusGeometry(5.1, 0.05, 12, 140),
      new THREE.MeshBasicMaterial({
        color: 0xffbd6e,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    photonRing.rotation.x = Math.PI / 2;

    // Halo suave ao redor do núcleo (leitura de "lente gravitacional").
    const coreGlow = new THREE.Mesh(
      new THREE.TorusGeometry(6.0, 1.05, 16, 120),
      new THREE.MeshBasicMaterial({
        color: 0xff8c2e,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    coreGlow.rotation.x = Math.PI / 2;

    // Aura quente ao redor do horizonte: anel radial com centro vazado, para a
    // sombra do buraco negro continuar legível por cima.
    const auraTexture = this.createAuraTexture();
    this.auraTexture = auraTexture;
    const aura = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: auraTexture,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    aura.scale.set(19, 19, 1);
    aura.renderOrder = 1;

    const core = new THREE.Group();
    core.add(horizon, photonRing, coreGlow, aura);
    this.galaxy.add(core);
  }

  private createAuraTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return new THREE.CanvasTexture(canvas);
    }

    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, center * 0.06, center, center, center);
    gradient.addColorStop(0.0, 'rgba(255, 160, 60, 0)');      // interior: vazio (sombra)
    gradient.addColorStop(0.22, 'rgba(255, 150, 50, 0)');
    gradient.addColorStop(0.34, 'rgba(255, 175, 75, 0.45)');   // rim brilhante
    gradient.addColorStop(0.5, 'rgba(255, 130, 35, 0.2)');
    gradient.addColorStop(0.78, 'rgba(255, 90, 25, 0.06)');
    gradient.addColorStop(1.0, 'rgba(255, 60, 10, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // -----------------------------------------------------------------------
  // Camada 2 — Disco de acreção (rotação diferencial + braços espirais)
  // -----------------------------------------------------------------------
  private buildAccretionDisk(): void {
    const count = this.diskCount;
    const maxR = 40;

    const positions = new Float32Array(count * 3);
    const aRadius = new Float32Array(count);
    const aAngle = new Float32Array(count);
    const aSize = new Float32Array(count);
    const aTwinkle = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribuição radial: anel denso logo após o fóton-ring, cauda longa.
      const r = 4.8 + (maxR - 4.8) * Math.pow(Math.random(), 1.55);
      const angle = Math.random() * Math.PI * 2;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      // Espessura vertical: fino no centro, leve flare na borda.
      const squash = 0.3 + r * 0.042;
      const y = (Math.random() + Math.random() + Math.random() - 1.5) * squash;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      aRadius[i] = r;
      aAngle[i] = angle;
      aSize[i] = (0.14 + 0.15 * Math.pow(1 - r / maxR, 2)) * (0.8 + Math.random() * 0.45);
      aTwinkle[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRadius', new THREE.BufferAttribute(aRadius, 1));
    geometry.setAttribute('aAngle', new THREE.BufferAttribute(aAngle, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
    geometry.setAttribute('aTwinkle', new THREE.BufferAttribute(aTwinkle, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uMaxR: { value: maxR },
        // Ponto do cursor projetado no plano do disco (galaxy-local).
        uMouse: { value: new THREE.Vector3(1000, 1000, 1000) },
        uMouseRadius: { value: 4.5 },
      },
      vertexShader: /* glsl */ `
        attribute float aRadius;
        attribute float aAngle;
        attribute float aSize;
        attribute float aTwinkle;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uMaxR;
        uniform vec3 uMouse;
        uniform float uMouseRadius;
        varying float vAlpha;
        varying float vGlow;

        void main() {
          // Rotação diferencial: omega ∝ r^(-0.65) — interior gira mais rápido.
          float omega = 0.16 * pow(aRadius, -0.65);
          float ang = aAngle + uTime * omega;

          vec3 pos = vec3(cos(ang) * aRadius, position.y, sin(ang) * aRadius);

          // Empurrão do ponteiro: partículas próximas ao cursor são deslocadas
          // para fora no plano do disco (+ leve arremesso vertical), e ganham
          // brilho — leitura de "perturbação".
          vec3 toMouse = pos - uMouse;
          float mouseDist = length(toMouse);
          float press = smoothstep(uMouseRadius, 0.0, mouseDist) * 0.9;
          if (press > 0.0) {
            vec3 pushDir = normalize(toMouse + vec3(0.0001, 0.0, 0.0001));
            pos.xz += pushDir.xz * press * 1.4;
            pos.y += press * (0.5 + 0.5 * sin(aTwinkle * 6.28318 + uTime * 1.5)) * 0.55;
            vAlpha *= 1.0 + press * 0.6;
          }

          // Braços espirais co-rotantes: 3 braços logarítmicos.
          float armPhase = ang - 1.6 * log(aRadius + 0.6);
          float arms = abs(fract(armPhase / 6.2831853 * 3.0) - 0.5) * 2.0;
          float arm = pow(smoothstep(0.8, 0.0, arms), 2.0);

          // Brilho assimétrico de acreção (lado que "se aproxima" mais quente).
          float doppler = 1.0 + 0.5 * sin(ang);

          float radialFade = 1.0 - smoothstep(0.5, 1.0, aRadius / uMaxR);
          float coreBoost = smoothstep(11.0, 5.0, aRadius);
          float twinkle = 0.85 + 0.15 * sin(uTime * 0.6 + aTwinkle);

          vAlpha = mix(0.10, 0.85, radialFade * coreBoost) * mix(0.45, 1.0, arm) * doppler * twinkle;
          vGlow = doppler * arm;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          float depthScale = 300.0 / max(-mvPosition.z, 2.0);
          float size = aSize * depthScale * uPixelRatio;
          size *= mix(1.0, 1.7, coreBoost);
          gl_PointSize = size;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        varying float vGlow;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          float mask = 1.0 - smoothstep(0.25, 0.5, d);
          if (mask <= 0.01) discard;

          vec3 inner = vec3(1.0, 0.72, 0.34);   // âmbar quente do disco
          vec3 hot   = vec3(1.0, 0.95, 0.78);   // creme ardente na acreção
          vec3 color = mix(inner, hot, vGlow);
          gl_FragColor = vec4(color, mask * vAlpha);
        }
      `,
    });

    this.disk = new THREE.Points(geometry, material);
    this.galaxy.add(this.disk);
  }

  // -----------------------------------------------------------------------
  // Camada 3 — Halo estelar esférico (velha população de estrelas)
  // -----------------------------------------------------------------------
  private buildStellarHalo(): void {
    const count = this.haloCount;

    const positions = new Float32Array(count * 3);
    const aSize = new Float32Array(count);
    const aPhase = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Casca esférica rarefeita ao redor do disco.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 24 + Math.random() * 52;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.85;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      aSize[i] = 0.05 + Math.random() * 0.18;
      aPhase[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aPhase;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vTwinkle;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float depthScale = 320.0 / max(-mvPosition.z, 2.0);
          gl_PointSize = aSize * depthScale * uPixelRatio;
          vTwinkle = 0.5 + 0.5 * sin(uTime * (0.3 + aPhase) + aPhase * 12.566);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vTwinkle;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          float mask = 1.0 - smoothstep(0.3, 0.5, d);
          if (mask <= 0.01) discard;
          gl_FragColor = vec4(vec3(0.7, 0.8, 0.95), mask * vTwinkle * 0.28);
        }
      `,
    });

    this.halo = new THREE.Points(geometry, material);
    this.galaxy.add(this.halo);
  }

  // -----------------------------------------------------------------------
  // Camada 4 — Orbital rings (finais) + cometas discretos
  // -----------------------------------------------------------------------
  private buildOrbitalRings(): void {
    const radii = [36, 47];

    for (let i = 0; i < radii.length; i++) {
      const group = new THREE.Group();
      const radius = radii[i];

      const geometry = new THREE.RingGeometry(radius - 0.04, radius + 0.04, 220, 1);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.55, 0.5, 0.55),
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      group.add(new THREE.Mesh(geometry, material));
      // Leve inclinação fora do plano do disco (órbita de satélite de alto órbit).
      group.rotation.x = Math.PI / 2 + (i % 2 === 0 ? 0.16 : -0.12);
      group.rotation.y = (i + 1) * 0.9;
      group.userData['spin'] = 0.00012 + i * 0.00004;

      this.rings.add(group);
    }
    this.galaxy.add(this.rings);
  }

  private buildComets(): void {
    const comets = [
      { a: 33, e: 0.5, tilt: 0.35, speed: 0.16, phase: 0 },
      { a: 40, e: 0.35, tilt: -0.48, speed: 0.09, phase: 2.1 },
      { a: 49, e: 0.6, tilt: 0.62, speed: 0.05, phase: 4.3 },
    ];

    for (const spec of comets) {
      const comet = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 6),
        new THREE.MeshBasicMaterial({
          color: 0xcfeaff,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      comet.userData['orbit'] = spec;
      this.galaxy.add(comet);
    }
  }

  /**
   * Projeta o ponteiro (NDC) no plano do disco e converte para o espaço da
   * galáxia. O plano usado é o XZ local da galáxia expresso no mundo — não o
   * y=0 do mundo! Como a galáxia é inclinada e escalada, interceptar y=0
   * fazia o empurrão colar no centro (e morrer) sobre a faixa superior da
   * tela, onde o título/conteúdo dominam.
   */
  private updateMouseUniform(target: THREE.Vector3): void {
    this.camera.updateMatrixWorld();
    this.scene.updateMatrixWorld(true);

    this.ndc.set(this.pointerPos.x, -this.pointerPos.y, 0.5).unproject(this.camera);
    this.camDir.copy(this.ndc).sub(this.camera.position).normalize();

    // Normal do plano do disco no mundo: o eixo Y local da galáxia.
    this.diskNormal.set(0, 1, 0).transformDirection(this.galaxy.matrixWorld);

    // O plano passa pela origem (o pivô da galáxia = o buraco negro).
    const denom = this.camDir.dot(this.diskNormal);
    if (Math.abs(denom) < 1e-6) {
      target.set(1000, 1000, 1000); // olhando o disco de perfil: sem interseção
      return;
    }

    // t = distância do raio até o plano: t·(dir·n) + cam·n = 0.
    const t = -this.camera.position.dot(this.diskNormal) / denom;
    if (t <= 0) {
      target.set(1000, 1000, 1000); // interseção atrás da câmera
      return;
    }

    this.mouseWorld.copy(this.camera.position).addScaledVector(this.camDir, t);
    this.galaxy.worldToLocal(this.mouseLocal.copy(this.mouseWorld));
    target.copy(this.mouseLocal);
  }

  private moveComets(): void {
    this.galaxy.children.forEach((child) => {
      if (child.type !== 'Mesh' || !child.userData['orbit']) return;

      const spec = child.userData['orbit'] as { a: number; e: number; tilt: number; speed: number; phase: number };
      const m = this.elapsed * spec.speed + spec.phase;
      // Primeira aproximação da anomalia excêntrica a partir da média.
      const anom = m + spec.e * Math.sin(m);

      // Ponto na elipse (plano orbital local) ...
      const xc = spec.a * (Math.cos(anom) - spec.e);
      const zc = spec.a * Math.sqrt(1 - spec.e * spec.e) * Math.sin(anom);

      // ... e inclinação do plano orbital em torno de X.
      child.position.set(xc, -zc * Math.sin(spec.tilt), zc * Math.cos(spec.tilt));
    });
  }

  // -----------------------------------------------------------------------
  // Loop
  // -----------------------------------------------------------------------
  private readonly tick = (now: number): void => {
    if (!this.running) return;
    this.elapsed += Math.min(now - this.lastTick, 50) / 1000;
    this.lastTick = now;

    // Precessão lenta + parallax: o alvo de rotação combina ângulo base, ponteiro
    // e giroscópio. Damping aplica inércia suave — o conjunto "flutua" em vez de colar.
    const targetX = OrbitalScene.BASE_ROT_X + this.pointerPos.y * 0.13 - this.tilt.x * 0.12;
    const targetY = OrbitalScene.BASE_ROT_Y + this.pointerPos.x * 0.22 + this.tilt.y * 0.12 + this.elapsed * 0.0006;
    const damp = 0.055;
    this.galaxy.rotation.x += (targetX - this.galaxy.rotation.x) * damp;
    this.galaxy.rotation.y += (targetY - this.galaxy.rotation.y) * damp;

    // Anéis orbitais spinam independentes (quase imperceptível).
    this.rings.children.forEach((group) => {
      const spin = group.userData['spin'] as number;
      group.rotation.z += spin;
    });

    if (this.disk) {
      const uniforms = (this.disk.material as THREE.ShaderMaterial).uniforms;
      uniforms['uTime'].value = this.elapsed;
      if (this.pointerActive) this.updateMouseUniform(uniforms['uMouse'].value as THREE.Vector3);
      else uniforms['uMouse'].value.set(1000, 1000, 1000);
    }
    if (this.halo) {
      const uniforms = (this.halo.material as THREE.ShaderMaterial).uniforms;
      uniforms['uTime'].value = this.elapsed;
    }

    this.moveComets();

    // Deriva sutil da câmera — combina respiração própria com parallax do ponteiro.
    this.camera.position.x = Math.sin(this.elapsed * 0.045) * 1.4 - this.pointerPos.x * 1.1;
    this.camera.position.y = 5 + Math.cos(this.elapsed * 0.032) * 0.6 - this.pointerPos.y * 0.7;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.tick);
  };
}