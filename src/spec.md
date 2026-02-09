# Specification

## Summary
**Goal:** Tornar o app totalmente funcional em modo BACKEND, com autenticação via Internet Identity, persistência durável (upgrade-safe) e controle de acesso por organização baseado em papéis (incluindo acesso global da Firsty).

**Planned changes:**
- Implementar persistência durável (resistente a upgrades) para todas as coleções do backend atualmente mantidas em memória, cobrindo organizações, perfis de usuário, memberships e todas as entidades do app (CRM, financeiro, NPS, documentos, relatórios, convites e mensagens de suporte).
- Adicionar gerenciamento de organizações e memberships no backend com regras de acesso: OWNER_ADMIN/MEMBER vinculados a uma única organização; FIRSTY_ADMIN/FIRSTY_CONSULTANT com acesso (leitura/escrita) a todas as organizações.
- Implementar no backend as APIs necessárias para o cliente de dados existente persistir as entidades do app (CRUD conforme aplicável), removendo/evitando caminhos “Not implemented in backend”.
- Persistir e rotear mensagens de suporte por organização, permitindo que usuários da organização vejam apenas seu próprio thread e que papéis Firsty listem e respondam threads de todas as organizações.
- Atualizar a integração do frontend em modo BACKEND para obter autenticação e contexto de papel/organização a partir do backend (Internet Identity + role context) e incluir um seletor/filtro de organização para papéis Firsty, aplicando a seleção a todas as telas com dados por organização.

**User-visible outcome:** Em modo BACKEND, usuários autenticam com Internet Identity; dados continuam disponíveis após upgrades; usuários comuns operam apenas na própria organização, enquanto perfis Firsty conseguem visualizar/selecionar qualquer organização e ler/editar dados e mensagens de suporte entre organizações.
