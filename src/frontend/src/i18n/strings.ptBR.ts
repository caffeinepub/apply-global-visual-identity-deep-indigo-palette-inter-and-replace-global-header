/**
 * Strings centralizadas em pt-BR para garantir consistência na UI.
 */

export const strings = {
  // Ações comuns
  save: 'Salvar',
  cancel: 'Cancelar',
  delete: 'Excluir',
  edit: 'Editar',
  create: 'Criar',
  add: 'Adicionar',
  remove: 'Remover',
  search: 'Buscar',
  filter: 'Filtrar',
  export: 'Exportar',
  import: 'Importar',
  close: 'Fechar',
  back: 'Voltar',
  next: 'Próximo',
  previous: 'Anterior',
  confirm: 'Confirmar',
  menu: 'Menu',
  rename: 'Renomear',
  moveLeft: 'Mover para esquerda',
  moveRight: 'Mover para direita',
  
  // Estados
  loading: 'Carregando...',
  saving: 'Salvando...',
  deleting: 'Excluindo...',
  processing: 'Processando...',
  creating: 'Criando...',
  updating: 'Atualizando...',
  
  // Estados vazios
  emptyState: {
    noData: 'Nenhum dado disponível',
    noResults: 'Nenhum resultado encontrado',
    noItems: 'Nenhum item encontrado',
    createFirst: 'Crie o primeiro item para começar',
    noColumns: 'Nenhuma coluna criada',
    noCardsInColumn: 'Nenhum card nesta coluna',
    noBoards: 'Nenhum board ainda',
    createFirstBoard: 'Crie seu primeiro board para começar a organizar seu pipeline',
  },
  
  // Erros
  error: {
    generic: 'Ocorreu um erro. Tente novamente.',
    loadFailed: 'Erro ao carregar dados',
    saveFailed: 'Erro ao salvar',
    deleteFailed: 'Erro ao excluir',
    unauthorized: 'Você não tem permissão para esta ação',
    notFound: 'Item não encontrado',
    createColumnFailed: 'Erro ao criar coluna',
    renameColumnFailed: 'Erro ao renomear coluna',
    deleteColumnFailed: 'Erro ao excluir coluna',
    reorderColumnsFailed: 'Erro ao reordenar colunas',
    createCardFailed: 'Erro ao criar card',
    updateCardFailed: 'Erro ao atualizar card',
    deleteCardFailed: 'Erro ao excluir card',
    moveCardFailed: 'Erro ao mover card',
    createBoardFailed: 'Erro ao criar board',
    renameBoardFailed: 'Erro ao renomear board',
  },
  
  // Sucesso
  success: {
    saved: 'Salvo com sucesso',
    deleted: 'Excluído com sucesso',
    created: 'Criado com sucesso',
    updated: 'Atualizado com sucesso',
    columnCreated: 'Coluna criada com sucesso',
    columnRenamed: 'Coluna renomeada com sucesso',
    columnDeleted: 'Coluna excluída com sucesso',
    columnsReordered: 'Ordem das colunas atualizada',
    cardCreated: 'Card criado com sucesso',
    cardUpdated: 'Card atualizado com sucesso',
    cardDeleted: 'Card excluído com sucesso',
    cardMoved: 'Card movido com sucesso',
    boardCreated: 'Board criado com sucesso',
    boardRenamed: 'Board renomeado com sucesso',
  },
  
  // Autenticação
  auth: {
    login: 'Entrar',
    logout: 'Sair',
    signup: 'Cadastrar',
    loggingIn: 'Entrando...',
    loginError: 'Erro ao fazer login',
    loginSuccess: 'Login realizado com sucesso',
  },
  
  // Navegação
  nav: {
    dashboard: 'Dashboard',
    contacts: 'Contatos',
    pipeline: 'Pipeline',
    activities: 'Atividades',
    contracts: 'Contratos',
    finance: 'Financeiro',
    customerSuccess: 'Sucesso do Cliente',
    reports: 'Relatórios',
    settings: 'Configurações',
    
    // Portal
    projectDashboard: 'Dashboard do Projeto',
    tasks: 'Tarefas',
    stageTimeline: 'Etapa & Cronograma',
    meetings: 'Reuniões',
    deliverables: 'Entregáveis',
    kpis: 'KPIs',
    documents: 'Documentos',
    messages: 'Mensagens',
    
    // Seções
    internalArea: 'Área Interna',
    portalArea: 'Portal do Cliente',
  },
  
  // Pipeline
  pipeline: {
    title: 'Pipeline de Vendas',
    description: 'Gerencie as etapas do seu pipeline',
    newColumn: 'Nova Coluna',
    columnName: 'Nome da Coluna',
    columnNamePlaceholder: 'Ex: Prospecção, Qualificação, Proposta...',
    renameColumn: 'Renomear Coluna',
    deleteColumn: 'Excluir Coluna',
    deleteColumnConfirm: 'Tem certeza que deseja excluir esta coluna? Esta ação não pode ser desfeita.',
    emptyColumnDescription: 'Crie sua primeira coluna para começar a organizar seu pipeline',
    board: 'Board',
    newBoard: 'Novo Board',
    createBoard: 'Criar Board',
    boardName: 'Nome do Board',
    boardNamePlaceholder: 'Ex: Pipeline de Vendas, Projetos Q1...',
  },
  
  // Cards
  card: {
    addCard: 'Adicionar Card',
    newCard: 'Novo Card',
    editCard: 'Editar Card',
    deleteCard: 'Excluir Card',
    createCard: 'Criar Card',
    cardTitle: 'Título',
    cardTitlePlaceholder: 'Título do card',
    cardDescription: 'Descrição',
    cardDescriptionPlaceholder: 'Descrição do card (opcional)',
    dueDate: 'Data de Vencimento',
    pickDate: 'Escolher data',
    clearDate: 'Limpar data',
    saveChanges: 'Salvar Alterações',
    makeChanges: 'Faça alterações no seu card aqui.',
    createNewCard: 'Crie um novo card nesta coluna.',
  },
  
  // Custom Fields
  customFields: {
    title: 'Campos Personalizados',
    addField: 'Adicionar Campo',
    fieldName: 'Nome do Campo',
    fieldNamePlaceholder: 'Digite o nome do campo',
    fieldType: 'Tipo do Campo',
    text: 'Texto',
    number: 'Número',
    date: 'Data',
    singleSelect: 'Seleção Única',
    multiSelect: 'Seleção Múltipla',
    tags: 'Tags',
    enterText: 'Digite o texto',
    enterNumber: 'Digite o número',
    selectOption: 'Selecione uma opção',
    addOption: 'Adicionar Opção',
    optionPlaceholder: 'Digite uma opção',
    addTag: 'Adicionar Tag',
    tagPlaceholder: 'Digite uma tag',
  },
};
