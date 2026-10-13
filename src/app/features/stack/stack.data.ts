export interface StackItem {
  name: string;
  category: string;
  icon: string;
  description: string;
  strength: string;
}

export const STACK_DATA: StackItem[] = [
  {
    name: 'ANGULAR',
    category: 'FRONTEND',
    icon: 'icons/angular.svg',
    description:
      'SPAs complexas com Signals, standalone components e animação fora da NgZone. O padrão usado nas landing pages e sistemas entregues.',
    strength: 'FRONTEND PRINCIPAL',
  },
  {
    name: 'SPRING BOOT',
    category: 'BACKEND',
    icon: 'icons/spring.svg',
    description:
      'APIs REST íntegras, filas, autenticação e contratos tipados. A escolha quando o cliente precisa de um sistema que escala em equipe.',
    strength: 'APIS CORPORATIVAS',
  },
  {
    name: 'DJANGO',
    category: 'BACKEND',
    icon: 'icons/django.svg',
    description:
      'Entrega rápida de backends com ORM poderoso, admin nativo e segurança por padrão. Ideal para MVPs com prazo apertado.',
    strength: 'ENTREGA RÁPIDA',
  },
  {
    name: 'THREE.JS + GSAP',
    category: 'EXPERIÊNCIA',
    icon: 'icons/threejs.svg',
    description:
      'Cenas 3D e animação sincronizada ao scroll para páginas que precisam impressionar sem matar a performance.',
    strength: 'DIFERENCIAL VISUAL',
  },
  {
    name: 'POSTGRESQL',
    category: 'DADOS',
    icon: 'icons/postgresql.svg',
    description:
      'Modelagem relacional, queries otimizadas e integridade forte para os dados que sustentam decisão de negócio.',
    strength: 'PERSISTÊNCIA',
  },
  {
    name: 'VERCEL + GIT',
    category: 'INFRAESTRUTURA',
    icon: 'icons/git.svg',
    description:
      'Deploy na Vercel, previews por PR e rollback instantâneo. Pipeline de revisão rígida antes de qualquer merge.',
    strength: 'CI/CD & DEPLOY',
  },
  {
    name: 'TAILWIND + LENIS',
    category: 'INTERFACE',
    icon: 'icons/tailwind.svg',
    description:
      'Design system utilitário com tokens próprios e scroll suave de 60fps. Controle fino sem o peso de um framework CSS.',
    strength: 'UI & MOTION',
  },
];