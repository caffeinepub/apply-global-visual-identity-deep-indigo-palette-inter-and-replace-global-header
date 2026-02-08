import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useAuth } from '../../auth/AuthProvider';
import { canAccessInternal } from '../../auth/roles';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  CheckSquare,
  FileText,
  DollarSign,
  Heart,
  BarChart3,
  Settings,
  FolderKanban,
  ListTodo,
  Calendar,
  Target,
  TrendingUp as TrendIcon,
  FileStack,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavSection {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const internalSections: NavSection[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Contatos',
    path: '/contatos',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Pipeline',
    path: '/pipeline',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    label: 'Atividades',
    path: '/atividades',
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    label: 'Contratos',
    path: '/contratos',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'Financeiro',
    path: '/financeiro',
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    label: 'Sucesso do Cliente',
    path: '/sucesso-cliente',
    icon: <Heart className="h-5 w-5" />,
  },
  {
    label: 'Relatórios',
    path: '/relatorios',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    label: 'Configurações',
    path: '/configuracoes',
    icon: <Settings className="h-5 w-5" />,
  },
];

const portalSections: NavSection[] = [
  {
    label: 'Dashboard do Projeto',
    path: '/portal/dashboard',
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    label: 'Tarefas',
    path: '/portal/tarefas',
    icon: <ListTodo className="h-5 w-5" />,
  },
  {
    label: 'Etapa & Cronograma',
    path: '/portal/etapa-cronograma',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: 'Reuniões',
    path: '/portal/reunioes',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Entregáveis',
    path: '/portal/entregaveis',
    icon: <Target className="h-5 w-5" />,
  },
  {
    label: 'KPIs',
    path: '/portal/kpis',
    icon: <TrendIcon className="h-5 w-5" />,
  },
  {
    label: 'Documentos',
    path: '/portal/documentos',
    icon: <FileStack className="h-5 w-5" />,
  },
  {
    label: 'Mensagens',
    path: '/portal/mensagens',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: 'Configurações',
    path: '/portal/configuracoes',
    icon: <Settings className="h-5 w-5" />,
  },
];

interface NavItemProps {
  section: NavSection;
  currentPath: string;
}

function NavItem({ section, currentPath }: NavItemProps) {
  const isActive = currentPath === section.path || currentPath.startsWith(section.path + '/');

  return (
    <li>
      <Link
        to={section.path}
        className={cn(
          'group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        {section.icon}
        <span className="flex-1">{section.label}</span>
      </Link>
    </li>
  );
}

export function Sidebar() {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Show internal navigation if authenticated and user has internal access
  // During loading, show navigation optimistically if authenticated
  const showInternal = isAuthenticated && (!user || (user && canAccessInternal(user.role)));
  const showPortal = isAuthenticated;

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col lg:pt-16">
      <div className="flex grow flex-col gap-y-6 overflow-y-auto border-r bg-background px-4 py-6">
        {showInternal && (
          <nav className="flex flex-1 flex-col">
            <div className="mb-3 px-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Área Interna
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                CRM & Gestão
              </p>
            </div>
            <ul role="list" className="space-y-1">
              {internalSections.map((section) => (
                <NavItem
                  key={section.path}
                  section={section}
                  currentPath={location.pathname}
                />
              ))}
            </ul>
          </nav>
        )}

        {showPortal && (
          <nav className="flex flex-1 flex-col">
            <div className="mb-3 px-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Portal do Cliente
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Projetos & Colaboração
              </p>
            </div>
            <ul role="list" className="space-y-1">
              {portalSections.map((section) => (
                <NavItem
                  key={section.path}
                  section={section}
                  currentPath={location.pathname}
                />
              ))}
            </ul>
          </nav>
        )}
      </div>
    </aside>
  );
}
