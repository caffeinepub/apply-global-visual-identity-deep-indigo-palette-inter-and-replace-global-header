import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { AppShell } from '../layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { PostAuthLanding } from './PostAuthLanding';

// Auth pages
import LoginPage from '../../pages/auth/LoginPage';
import SignupPage from '../../pages/auth/SignupPage';
import CreateOrganizationPage from '../../pages/auth/CreateOrganizationPage';
import SelectOrganizationPage from '../../pages/auth/SelectOrganizationPage';

// Internal pages
import DashboardPage from '../../pages/internal/DashboardPage';
import ContactsPage from '../../pages/internal/ContactsPage';
import PipelinePage from '../../pages/internal/PipelinePage';
import DealDetailPage from '../../pages/internal/DealDetailPage';
import ActivitiesPage from '../../pages/internal/ActivitiesPage';
import ContractsPage from '../../pages/internal/ContractsPage';
import FinancePage from '../../pages/internal/FinancePage';
import CustomerSuccessPage from '../../pages/internal/CustomerSuccessPage';
import ReportsPage from '../../pages/internal/ReportsPage';
import SettingsPage from '../../pages/internal/SettingsPage';

// Portal pages
import ProjectDashboardPage from '../../pages/portal/ProjectDashboardPage';
import TasksPage from '../../pages/portal/TasksPage';
import StageTimelinePage from '../../pages/portal/StageTimelinePage';
import MeetingsPage from '../../pages/portal/MeetingsPage';
import DeliverablesPage from '../../pages/portal/DeliverablesPage';
import KpisPage from '../../pages/portal/KpisPage';
import DocumentsPage from '../../pages/portal/DocumentsPage';
import MessagesPage from '../../pages/portal/MessagesPage';
import PortalSettingsPage from '../../pages/portal/PortalSettingsPage';

// Root route with AppShell layout
export const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

// Auth routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cadastro',
  component: SignupPage,
});

const createOrgRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/criar-organizacao',
  component: () => (
    <ProtectedRoute>
      <CreateOrganizationPage />
    </ProtectedRoute>
  ),
});

const selectOrgRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/selecionar-organizacao',
  component: () => (
    <ProtectedRoute>
      <SelectOrganizationPage />
    </ProtectedRoute>
  ),
});

// Landing após autenticação
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PostAuthLanding,
});

// Internal routes
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute requireOrg>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

const contactsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contatos',
  component: () => (
    <ProtectedRoute requireOrg>
      <ContactsPage />
    </ProtectedRoute>
  ),
});

const pipelineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pipeline',
  component: () => (
    <ProtectedRoute requireOrg>
      <PipelinePage />
    </ProtectedRoute>
  ),
});

const dealDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pipeline/$dealId',
  component: () => (
    <ProtectedRoute requireOrg>
      <DealDetailPage />
    </ProtectedRoute>
  ),
});

const activitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/atividades',
  component: () => (
    <ProtectedRoute requireOrg>
      <ActivitiesPage />
    </ProtectedRoute>
  ),
});

const contractsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contratos',
  component: () => (
    <ProtectedRoute requireOrg>
      <ContractsPage />
    </ProtectedRoute>
  ),
});

const financeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/financeiro',
  component: () => (
    <ProtectedRoute requireOrg>
      <FinancePage />
    </ProtectedRoute>
  ),
});

const customerSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sucesso-cliente',
  component: () => (
    <ProtectedRoute requireOrg>
      <CustomerSuccessPage />
    </ProtectedRoute>
  ),
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/relatorios',
  component: () => (
    <ProtectedRoute requireOrg>
      <ReportsPage />
    </ProtectedRoute>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/configuracoes',
  component: () => (
    <ProtectedRoute requireOrg>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

// Portal routes
const portalDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/dashboard',
  component: () => (
    <ProtectedRoute requireOrg>
      <ProjectDashboardPage />
    </ProtectedRoute>
  ),
});

const portalTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/tarefas',
  component: () => (
    <ProtectedRoute requireOrg>
      <TasksPage />
    </ProtectedRoute>
  ),
});

const portalStageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/etapa-cronograma',
  component: () => (
    <ProtectedRoute requireOrg>
      <StageTimelinePage />
    </ProtectedRoute>
  ),
});

const portalMeetingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/reunioes',
  component: () => (
    <ProtectedRoute requireOrg>
      <MeetingsPage />
    </ProtectedRoute>
  ),
});

const portalDeliverablesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/entregaveis',
  component: () => (
    <ProtectedRoute requireOrg>
      <DeliverablesPage />
    </ProtectedRoute>
  ),
});

const portalKpisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/kpis',
  component: () => (
    <ProtectedRoute requireOrg>
      <KpisPage />
    </ProtectedRoute>
  ),
});

const portalDocumentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/documentos',
  component: () => (
    <ProtectedRoute requireOrg>
      <DocumentsPage />
    </ProtectedRoute>
  ),
});

const portalMessagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/mensagens',
  component: () => (
    <ProtectedRoute requireOrg>
      <MessagesPage />
    </ProtectedRoute>
  ),
});

const portalSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/configuracoes',
  component: () => (
    <ProtectedRoute requireOrg>
      <PortalSettingsPage />
    </ProtectedRoute>
  ),
});

// Build route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  createOrgRoute,
  selectOrgRoute,
  dashboardRoute,
  contactsRoute,
  pipelineRoute,
  dealDetailRoute,
  activitiesRoute,
  contractsRoute,
  financeRoute,
  customerSuccessRoute,
  reportsRoute,
  settingsRoute,
  portalDashboardRoute,
  portalTasksRoute,
  portalStageRoute,
  portalMeetingsRoute,
  portalDeliverablesRoute,
  portalKpisRoute,
  portalDocumentsRoute,
  portalMessagesRoute,
  portalSettingsRoute,
]);
