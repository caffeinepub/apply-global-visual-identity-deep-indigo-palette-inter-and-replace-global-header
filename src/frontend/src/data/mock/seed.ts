import type {
  Organization,
  User,
  OrgAccess,
  Project,
  ProjectMember,
  Task,
  Meeting,
  Deliverable,
  Kpi,
  Message,
  Document,
  Contact,
  Deal,
  Activity,
  Contract,
  FinanceTransaction,
} from '../../types/model';

// ============================================================================
// ORGANIZAÇÕES
// ============================================================================

export const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Empresa Demo',
    owner: 'user-owner-1',
    createdAt: new Date('2025-01-01'),
  },
];

// ============================================================================
// USUÁRIOS
// ============================================================================

export const mockUsers: User[] = [
  {
    id: 'user-owner-1',
    orgId: 'org-1',
    role: 'OWNER_ADMIN',
    name: 'Ana Silva',
    email: 'ana.silva@empresa.com.br',
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'user-member-1',
    orgId: 'org-1',
    role: 'MEMBER',
    name: 'Carlos Santos',
    email: 'carlos.santos@empresa.com.br',
    isActive: true,
    createdAt: new Date('2025-01-02'),
  },
  {
    id: 'user-client-1',
    orgId: 'org-1',
    role: 'CLIENT',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@cliente.com.br',
    isActive: true,
    createdAt: new Date('2025-01-03'),
  },
  {
    id: 'user-consultant-1',
    orgId: 'org-1',
    role: 'FIRSTY_CONSULTANT',
    name: 'João Ferreira',
    email: 'joao.ferreira@firsty.com.br',
    isActive: true,
    createdAt: new Date('2025-01-04'),
  },
  {
    id: 'user-admin-1',
    orgId: 'org-1',
    role: 'FIRSTY_ADMIN',
    name: 'Paula Costa',
    email: 'paula.costa@firsty.com.br',
    isActive: true,
    createdAt: new Date('2025-01-05'),
  },
];

// ============================================================================
// ACESSO A ORGANIZAÇÕES
// ============================================================================

export const mockOrgAccess: OrgAccess[] = [
  {
    orgId: 'org-1',
    userId: 'user-consultant-1',
    permission: 'write',
    createdAt: new Date('2025-01-04'),
  },
];

// ============================================================================
// PROJETOS
// ============================================================================

export const mockProjects: Project[] = [
  {
    id: 'project-solo-1',
    orgId: 'org-1',
    name: 'Projeto Solo - Consultoria Individual',
    clientName: 'Maria Oliveira',
    businessProfile: 'solo',
    journeyMonths: 3,
    stage: 'execution_30',
    startDate: new Date('2025-01-15'),
    onboardingStartDate: new Date('2025-01-15'),
    executionStartDate: new Date('2025-01-22'),
    createdBy: 'user-owner-1',
    createdAt: new Date('2025-01-10'),
  },
  {
    id: 'project-sme-1',
    orgId: 'org-1',
    name: 'Projeto PME - Expansão Comercial',
    clientName: 'Empresa XYZ Ltda',
    businessProfile: 'sme',
    journeyMonths: 6,
    stage: 'execution_continuous',
    startDate: new Date('2024-12-01'),
    onboardingStartDate: new Date('2024-12-01'),
    executionStartDate: new Date('2024-12-15'),
    createdBy: 'user-owner-1',
    createdAt: new Date('2024-11-25'),
  },
];

// ============================================================================
// MEMBROS DOS PROJETOS
// ============================================================================

export const mockProjectMembers: ProjectMember[] = [
  // Projeto Solo
  { orgId: 'org-1', projectId: 'project-solo-1', userId: 'user-client-1', role: 'client' },
  { orgId: 'org-1', projectId: 'project-solo-1', userId: 'user-consultant-1', role: 'firsty' },
  { orgId: 'org-1', projectId: 'project-solo-1', userId: 'user-owner-1', role: 'admin' },
  
  // Projeto SME
  { orgId: 'org-1', projectId: 'project-sme-1', userId: 'user-client-1', role: 'client' },
  { orgId: 'org-1', projectId: 'project-sme-1', userId: 'user-member-1', role: 'member' },
  { orgId: 'org-1', projectId: 'project-sme-1', userId: 'user-consultant-1', role: 'firsty' },
  { orgId: 'org-1', projectId: 'project-sme-1', userId: 'user-owner-1', role: 'admin' },
];

// ============================================================================
// TAREFAS
// ============================================================================

export const mockTasks: Task[] = [
  // Projeto Solo
  {
    id: 'task-solo-1',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    title: 'Definir objetivos principais do negócio',
    description: 'Mapear os 3 principais objetivos para os próximos 90 dias',
    status: 'done',
    pillar: 'Estratégia',
    dueDate: new Date('2025-01-20'),
    ownerUserId: 'user-client-1',
    ownerRole: 'client',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'task-solo-2',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    title: 'Revisar fluxo de caixa atual',
    description: 'Analisar entradas e saídas dos últimos 3 meses',
    status: 'doing',
    pillar: 'Financeiro',
    dueDate: new Date('2025-02-10'),
    ownerUserId: 'user-client-1',
    ownerRole: 'client',
    createdAt: new Date('2025-01-22'),
  },
  {
    id: 'task-solo-3',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    title: 'Criar proposta de valor clara',
    description: 'Definir o que torna seu serviço único',
    status: 'todo',
    pillar: 'Estratégia',
    dueDate: new Date('2025-02-15'),
    ownerUserId: 'user-client-1',
    ownerRole: 'client',
    createdAt: new Date('2025-01-22'),
  },
  
  // Projeto SME
  {
    id: 'task-sme-1',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    title: 'Implementar CRM para equipe comercial',
    description: 'Configurar e treinar equipe no novo sistema',
    status: 'done',
    pillar: 'Tecnologia',
    dueDate: new Date('2025-01-15'),
    ownerUserId: 'user-member-1',
    ownerRole: 'member',
    createdAt: new Date('2024-12-15'),
  },
  {
    id: 'task-sme-2',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    title: 'Definir processo de onboarding de clientes',
    description: 'Criar fluxo padronizado para novos clientes',
    status: 'doing',
    pillar: 'Operações',
    dueDate: new Date('2025-02-20'),
    ownerUserId: 'user-member-1',
    ownerRole: 'member',
    createdAt: new Date('2025-01-10'),
  },
  {
    id: 'task-sme-3',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    title: 'Contratar analista de marketing',
    description: 'Processo seletivo para expansão da equipe',
    status: 'todo',
    pillar: 'Pessoas',
    dueDate: new Date('2025-03-01'),
    ownerUserId: 'user-owner-1',
    ownerRole: 'admin',
    createdAt: new Date('2025-01-20'),
  },
];

// ============================================================================
// REUNIÕES
// ============================================================================

export const mockMeetings: Meeting[] = [
  // Projeto Solo
  {
    id: 'meeting-solo-1',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    title: 'Reunião Semanal - Semana 1',
    datetime: new Date('2025-01-22T10:00:00'),
    cadence: 'semanal',
    notes: 'Alinhamento inicial dos objetivos e próximos passos.',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'meeting-solo-2',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    title: 'Reunião Semanal - Semana 2',
    datetime: new Date('2025-01-29T10:00:00'),
    cadence: 'semanal',
    notes: 'Revisão do fluxo de caixa e ajustes na estratégia.',
    createdAt: new Date('2025-01-22'),
  },
  {
    id: 'meeting-solo-3',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    title: 'Reunião Semanal - Semana 3',
    datetime: new Date('2025-02-05T10:00:00'),
    cadence: 'semanal',
    notes: '',
    createdAt: new Date('2025-01-29'),
  },
  
  // Projeto SME
  {
    id: 'meeting-sme-1',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    title: 'Reunião Quinzenal - Janeiro',
    datetime: new Date('2025-01-15T14:00:00'),
    cadence: 'quinzenal',
    notes: 'Revisão de KPIs e planejamento do próximo ciclo.',
    createdAt: new Date('2025-01-10'),
  },
  {
    id: 'meeting-sme-2',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    title: 'Reunião Quinzenal - Fevereiro',
    datetime: new Date('2025-02-05T14:00:00'),
    cadence: 'quinzenal',
    notes: '',
    createdAt: new Date('2025-01-25'),
  },
];

// ============================================================================
// ENTREGÁVEIS
// ============================================================================

export const mockDeliverables: Deliverable[] = [
  // Projeto Solo
  {
    id: 'deliv-solo-1',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    title: 'Plano Estratégico 90 dias',
    category: 'Planejamento',
    status: 'entregue',
    dueDate: new Date('2025-01-25'),
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'deliv-solo-2',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    title: 'Análise Financeira Inicial',
    category: 'Financeiro',
    status: 'em_andamento',
    dueDate: new Date('2025-02-10'),
    createdAt: new Date('2025-01-22'),
  },
  {
    id: 'deliv-solo-3',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    title: 'Proposta de Valor Revisada',
    category: 'Marketing',
    status: 'planejado',
    dueDate: new Date('2025-02-20'),
    createdAt: new Date('2025-01-22'),
  },
  
  // Projeto SME
  {
    id: 'deliv-sme-1',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    title: 'Processo de Vendas Documentado',
    category: 'Operações',
    status: 'entregue',
    dueDate: new Date('2025-01-10'),
    createdAt: new Date('2024-12-15'),
  },
  {
    id: 'deliv-sme-2',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    title: 'Dashboard de KPIs Comerciais',
    category: 'Tecnologia',
    status: 'entregue',
    dueDate: new Date('2025-01-20'),
    createdAt: new Date('2025-01-05'),
  },
  {
    id: 'deliv-sme-3',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    title: 'Manual de Onboarding de Clientes',
    category: 'Operações',
    status: 'em_andamento',
    dueDate: new Date('2025-02-25'),
    createdAt: new Date('2025-01-15'),
  },
];

// ============================================================================
// KPIs
// ============================================================================

export const mockKpis: Kpi[] = [
  // Projeto Solo
  {
    id: 'kpi-solo-1',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    name: 'Receita Mensal',
    value: 'R$ 8.500',
    trend: 'up',
    note: 'Crescimento de 12% em relação ao mês anterior',
    updatedAt: new Date('2025-02-01'),
  },
  {
    id: 'kpi-solo-2',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    name: 'Novos Clientes',
    value: '3',
    trend: 'up',
    note: 'Meta mensal atingida',
    updatedAt: new Date('2025-02-01'),
  },
  
  // Projeto SME
  {
    id: 'kpi-sme-1',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    name: 'Taxa de Conversão',
    value: '18%',
    trend: 'up',
    note: 'Aumento de 3 pontos percentuais',
    updatedAt: new Date('2025-02-01'),
  },
  {
    id: 'kpi-sme-2',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    name: 'Ticket Médio',
    value: 'R$ 2.450',
    trend: 'flat',
    note: 'Estável em relação ao período anterior',
    updatedAt: new Date('2025-02-01'),
  },
  {
    id: 'kpi-sme-3',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    name: 'Churn Rate',
    value: '2,5%',
    trend: 'down',
    note: 'Redução significativa após melhorias no onboarding',
    updatedAt: new Date('2025-02-01'),
  },
];

// ============================================================================
// MENSAGENS
// ============================================================================

export const mockMessages: Message[] = [
  // Projeto Solo
  {
    id: 'msg-solo-1',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    text: 'Olá! Estou animada para começar nossa jornada. Tenho algumas dúvidas sobre o plano estratégico.',
    createdBy: 'user-client-1',
    createdByRole: 'client',
    createdAt: new Date('2025-01-16T09:30:00'),
  },
  {
    id: 'msg-solo-2',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    text: 'Ótimo! Vamos alinhar tudo na nossa primeira reunião. Já preparei um roteiro para facilitar.',
    createdBy: 'user-consultant-1',
    createdByRole: 'firsty',
    createdAt: new Date('2025-01-16T10:15:00'),
  },
  {
    id: 'msg-solo-3',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    text: 'Perfeito! Até lá.',
    createdBy: 'user-client-1',
    createdByRole: 'client',
    createdAt: new Date('2025-01-16T10:20:00'),
  },
  
  // Projeto SME
  {
    id: 'msg-sme-1',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    text: 'Bom dia! Gostaria de revisar os KPIs antes da próxima reunião.',
    createdBy: 'user-member-1',
    createdByRole: 'member',
    createdAt: new Date('2025-02-03T08:00:00'),
  },
  {
    id: 'msg-sme-2',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    text: 'Claro! Acabei de atualizar o dashboard. Dá uma olhada e me avisa se precisa de algum ajuste.',
    createdBy: 'user-consultant-1',
    createdByRole: 'firsty',
    createdAt: new Date('2025-02-03T09:30:00'),
  },
];

// ============================================================================
// DOCUMENTOS
// ============================================================================

export const mockDocuments: Document[] = [
  // Projeto Solo
  {
    id: 'doc-solo-1',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    title: 'Guia de Onboarding',
    url: '#',
    category: 'Onboarding',
    createdBy: 'user-consultant-1',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'doc-solo-2',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    title: 'Template de Planejamento Estratégico',
    url: '#',
    category: 'Planejamento',
    createdBy: 'user-consultant-1',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'doc-solo-3',
    orgId: 'org-1',
    projectId: 'project-solo-1',
    title: 'Planilha de Controle Financeiro',
    url: '#',
    category: 'Financeiro',
    createdBy: 'user-consultant-1',
    createdAt: new Date('2025-01-22'),
  },
  
  // Projeto SME
  {
    id: 'doc-sme-1',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    title: 'Processo de Vendas - Fluxograma',
    url: '#',
    category: 'Operações',
    createdBy: 'user-consultant-1',
    createdAt: new Date('2024-12-15'),
  },
  {
    id: 'doc-sme-2',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    title: 'Dashboard de KPIs - Acesso',
    url: '#',
    category: 'Tecnologia',
    createdBy: 'user-consultant-1',
    createdAt: new Date('2025-01-10'),
  },
  {
    id: 'doc-sme-3',
    orgId: 'org-1',
    projectId: 'project-sme-1',
    title: 'Manual de Marca',
    url: '#',
    category: 'Marketing',
    createdBy: 'user-member-1',
    createdAt: new Date('2025-01-20'),
  },
];

// ============================================================================
// CRM - CONTATOS (para área interna)
// ============================================================================

export const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    orgId: 'org-1',
    name: 'Roberto Almeida',
    email: 'roberto.almeida@empresa.com.br',
    phone: '(11) 98765-4321',
    company: 'Tech Solutions Ltda',
    tags: ['lead', 'tecnologia'],
    status: 'ativo',
    ownerUserId: 'user-owner-1',
    notes: 'Interessado em consultoria de expansão',
    attachments: [],
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10'),
  },
  {
    id: 'contact-2',
    orgId: 'org-1',
    name: 'Fernanda Costa',
    email: 'fernanda@startup.io',
    phone: '(21) 99876-5432',
    company: 'Startup Inovadora',
    tags: ['cliente', 'startup'],
    status: 'ativo',
    ownerUserId: 'user-member-1',
    notes: 'Cliente desde 2024',
    attachments: [],
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2025-01-20'),
  },
];

// ============================================================================
// CRM - DEALS (para área interna)
// ============================================================================

export const mockDeals: Deal[] = [
  {
    id: 'deal-1',
    orgId: 'org-1',
    title: 'Consultoria Tech Solutions',
    contactId: 'contact-1',
    stage: 'Proposta',
    status: 'open',
    value: 15000,
    probability: 70,
    ownerUserId: 'user-owner-1',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-28'),
  },
];

// ============================================================================
// CRM - ATIVIDADES (para área interna)
// ============================================================================

export const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    orgId: 'org-1',
    type: 'meeting',
    dueDate: new Date('2025-02-10T14:00:00'),
    status: 'open',
    ownerUserId: 'user-owner-1',
    relatedType: 'deal',
    relatedId: 'deal-1',
    notes: 'Apresentação da proposta final',
    createdAt: new Date('2025-01-28'),
    updatedAt: new Date('2025-01-28'),
  },
];

// ============================================================================
// CRM - CONTRATOS (para área interna)
// ============================================================================

export const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    orgId: 'org-1',
    contactId: 'contact-2',
    name: 'Consultoria Mensal - Startup Inovadora',
    mrr: 3500,
    startDate: new Date('2024-12-01'),
    renewalDate: new Date('2025-12-01'),
    status: 'active',
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2024-12-01'),
  },
];

// ============================================================================
// FINANCEIRO (para área interna)
// ============================================================================

export const mockFinanceTransactions: FinanceTransaction[] = [
  {
    id: 'fin-1',
    orgId: 'org-1',
    type: 'income',
    date: new Date('2025-01-05'),
    value: 3500,
    category: 'Consultoria',
    description: 'Pagamento mensal - Startup Inovadora',
    isRecurring: true,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-05'),
  },
  {
    id: 'fin-2',
    orgId: 'org-1',
    type: 'expense',
    date: new Date('2025-01-10'),
    value: 500,
    category: 'Software',
    description: 'Assinatura CRM',
    isRecurring: true,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10'),
  },
];
