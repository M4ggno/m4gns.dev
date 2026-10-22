export interface WorkItem {
  id: number;
  title: string;
  category: string;
  description: string;
  tech: string[];
  link: string;
  image: string;
  metrics: string;
}

/**
 * Casos reais: produtos vendidos e em produção hoje (landing pages comerciais).
 * Descrições e métricas são factuais — extraídas do próprio site do cliente.
 */
export const WORK_DATA: WorkItem[] = [
  {
    id: 1,
    title: 'SIMONE CORDEIRO',
    category: 'PSICOLOGIA CLÍNICA',
    description:
      'Landing page de alta conversão para psicóloga clínica em Patos/PB: copy empática com base na TCC, atendimento para crianças, adolescentes e adultos, FAQ de primeira sessão e agendamento direto — presencial e online.',
    tech: ['One-Page', 'Copy Estratégica', 'WhatsApp'],
    link: 'https://simonecordeiro.aureaecosystembiosite.com/',
    image: 'images/simone-mockup.svg',
    metrics: 'CRP 13/7004 // +10 ANOS // PRESENCIAL + ONLINE',
  },
  {
    id: 2,
    title: 'DRA. ANNE VALÉRIA',
    category: 'PNEUMO · ALERGO · IMUNO',
    description:
      'Landing page premium para médica com 37 anos de exercício: três especialidades, exames (espirometria, polissonografia, imunoterapia), atendimento em cinco cidades do Nordeste e agendamento direto pelo WhatsApp.',
    tech: ['One-Page', 'SEO Médico', 'WhatsApp'],
    link: 'https://annevaleria.aureaecosystem.com.br/',
    image: 'images/anne-mockup.svg',
    metrics: '37 ANOS // 3 ESPECIALIDADES // 5 CIDADES',
  },
];