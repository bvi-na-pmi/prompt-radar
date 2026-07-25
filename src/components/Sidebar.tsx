import React from 'react';
import {
  LayoutDashboard,
  ListFilter,
  BarChart3,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export type TabType = 'copilot' | 'overview' | 'requests' | 'analytics';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  const navItems = [
    {
      id: 'copilot' as TabType,
      label: 'ИИ-Копилот',
      icon: Sparkles,
    },
    {
      id: 'overview' as TabType,
      label: 'Сводка',
      icon: LayoutDashboard,
    },
    {
      id: 'requests' as TabType,
      label: 'Реестр',
      icon: ListFilter,
    },
    {
      id: 'analytics' as TabType,
      label: 'Аналитика',
      icon: BarChart3,
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
        {/* Top Header / Branding */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
            <span className="font-bold text-sm tracking-tight text-white block mx-auto">
              Промпт-Радар
            </span>
          </div>

          {/* Navigation Section */}
        <nav className="p-2 space-y-1 mt-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                } ${collapsed ? 'justify-center' : 'justify-between'}`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

    </aside>
  );
};
