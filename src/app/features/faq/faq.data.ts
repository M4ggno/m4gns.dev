export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Perguntas que bloqueiam a decisão — respondidas com dado, não com retórica.
 * A seção <app-faq> é pré-renderizada (SSG) e o FAQPage JSON-LD em src/index.html
 * espelha este arquivo. IMPORTANTE: ao editar aqui, mantenha o script
 * <script type="application/ld+json"> do FAQPage em src/index.html em sincronia.
 */
export const FAQ_DATA: FaqItem[] = [
  {
    question: 'Quanto custa um projeto?',
    answer:
      'Não existe tabela fixa — existe dado. O diagnóstico técnico é gratuito e sai em até 48h; a proposta chega com preço fechado, prazo e condição de pagamento, por escrito e sem surpresa no meio do caminho.',
  },
  {
    question: 'Qual o prazo de entrega?',
    answer:
      'Landing pages de alta conversão: 7 a 14 dias. Sistemas sob medida: 4 a 12 semanas, conforme o escopo. O prazo entra no contrato e é cumprido em marcos — nunca numa data mágica.',
  },
  {
    question: 'Como funciona o processo?',
    answer:
      'Diagnóstico técnico (até 48h) → proposta por escrito → desenvolvimento com entrega semanal → deploy em produção. Você fala direto com o engenheiro responsável, sem gerente de conta no meio.',
  },
  {
    question: 'E se eu não entender de tecnologia?',
    answer:
      'Você não precisa. O diagnóstico converte problema de negócio em escopo técnico, e cada entrega semanal é descrita por resultado — nunca por jargão. O contrato é escrito para quem não é técnico.',
  },
  {
    question: 'E depois que o site estiver no ar?',
    answer:
      'A entrega inclui documentação, acessos e dados do projeto. A manutenção é opcional — plano mensal ou atendimento sob demanda — sempre pelo canal direto, com resposta em até 48h.',
  },
  {
    question: 'Atendem clientes fora do Brasil?',
    answer:
      'Sim. O trabalho é 100% remoto, com alinhamento por vídeo nos marcos e comunicação assíncrona por e-mail. A única diferença é o fuso do e-mail.',
  },
];