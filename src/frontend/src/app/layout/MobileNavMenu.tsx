import React from 'react';
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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';

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

interface MobileNavMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavMenu({ open, onOpenChange }: MobileNavMenuProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const showInternal = isAuthenticated && (!user || (user && canAccessInternal(user.role)));
  const showPortal = isAuthenticated;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-y-6 overflow-y-auto px-4 py-6 h-[calc(100vh-5rem)]">
          {showInternal && (
            <nav>
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
                  <li key={section.path}>
                    <SheetClose asChild>
                      <Link
                        to={section.path}
                        className={cn(
                          'group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive(section.path)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        {section.icon}
                        <span className="flex-1">{section.label}</span>
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {showPortal && (
            <nav>
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
                  <li key={section.path}>
                    <SheetClose asChild>
                      <Link
                        to={section.path}
                        className={cn(
                          'group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive(section.path)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        {section.icon}
                        <span className="flex-1">{section.label}</span>
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
