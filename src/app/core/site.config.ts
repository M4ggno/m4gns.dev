/**
 * Configuração central do site.
 * Trocar endereço de e-mail, redes ou domínio aqui — nunca nos componentes.
 */
export const SITE = {
  name: 'M4GNS.DEV',
  operator: 'Magno de Souza Carneiro Filho',
  domain: 'm4gns.dev',

  /** Canal primário de conversão */
  email: {
    address: 'contato@m4gns.dev',
    subject: '[PROJETO] Escopo & Prazo',
  },

  /** Canais secundários */
  social: {
    instagram: {
      handle: '@m4gns.dev',
      url: 'https://www.instagram.com/m4gns.dev',
      label: 'Feed diário de engenharia',
    },
    github: {
      handle: 'github.com/m4gns',
      url: 'https://github.com/m4gns',
    },
  },

  /** Janela de resposta prometida (credibilidade) */
  responseTime: '≤ 48h',
} as const;