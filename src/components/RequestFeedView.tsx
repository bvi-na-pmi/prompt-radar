import React, { useState } from 'react';
import { RequestLog, CategoryType, DepartmentType, RequestStatus } from '../types';
import {
  ListFilter,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
  Wrench,
  User,
  RefreshCw,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  X,
  Send,
  Trash2,
  SlidersHorizontal,
  Filter
} from 'lucide-react';

interface RequestFeedViewProps {
  logs: RequestLog[];
  onAddSyntheticPrompt: () => void;
  onNavigateToTester: () => void;
  onAddCustomLog?: (newLog: RequestLog) => void;
  onDeleteLog?: (id: string) => void;
}

function inferToolsFromPromptText(promptText: string): { tools: string[]; category: CategoryType; department: DepartmentType; scenarioTitle: string; aiSummary: string } {
  const lower = promptText.toLowerCase();
  const tools: string[] = [];

  if (lower.includes('почт') || lower.includes('письм') || lower.includes('mail') || lower.includes('outlook')) {
    tools.push('Outlook Mail API');
  }
  if (lower.includes('jira') || lower.includes('жир') || lower.includes('таск') || lower.includes('тикет') || lower.includes('спринт')) {
    tools.push('Jira REST API');
  }
  if (lower.includes('confluence') || lower.includes('вики') || lower.includes('регламент')) {
    tools.push('Confluence Search API');
  }
  if (lower.includes('договор') || lower.includes('юрист') || lower.includes('риск')) {
    tools.push('Docx Reader', 'Legal Risk Analyzer');
  }
  if (lower.includes('excel') || lower.includes('выручк') || lower.includes('kpi') || lower.includes('отчет')) {
    tools.push('Excel Export Tool');
  }
  if (lower.includes('crm') || lower.includes('bitrix') || lower.includes('клиент')) {
    tools.push('Bitrix24 CRM API');
  }
  if (lower.includes('sql') || lower.includes('postgres') || lower.includes('бд')) {
    tools.push('PostgreSQL Client');
  }
  if (lower.includes('slack') || lower.includes('сообщени')) {
    tools.push('Slack Webhook');
  }
  if (lower.includes('zendesk') || lower.includes('обращени')) {
    tools.push('Zendesk API');
  }

  if (tools.length === 0) {
    tools.push('REST API Connector', 'Data Parser');
  }

  let category: CategoryType = 'Поиск & База знаний';
  let department: DepartmentType = 'Администрация';
  let scenarioTitle = 'Произвольный запрос Администратора';
  let aiSummary = 'Запрос успешно зафиксирован и исполнен в интеграционной среде.';

  if (lower.includes('почт') && lower.includes('jira')) {
    category = 'CRM & Продажи';
    department = 'Администрация';
    scenarioTitle = 'Анализ почты от руководства и создание задач в Jira';
    aiSummary = 'Проанализирована почта за смену, выявлены ключевые указания руководства и автоматически созданы соответствующее таски в Jira.';
  } else if (lower.includes('почт') || lower.includes('письм') || lower.includes('сводк')) {
    category = 'Коммуникации & Почта';
    department = 'Администрация';
    scenarioTitle = 'Суммаризация и разбор корпоративной почты';
    aiSummary = 'Проанализировано содержимое почтового ящика, выделены ключевые темы и срочные задачи.';
  } else if (lower.includes('договор') || lower.includes('юрист') || lower.includes('соглашени') || lower.includes('риск')) {
    category = 'Документооборот & Договоры';
    department = 'Юридический Отдел & Комплаенс';
    scenarioTitle = 'Экспресс-аудит юридического документа';
    aiSummary = 'Проведена валидация условий документа, проверены риски ответственности и ключевые пункты.';
  } else if (lower.includes('отчет') || lower.includes('excel') || lower.includes('выручк') || lower.includes('kpi') || lower.includes('данны')) {
    category = 'Отчетность & Аналитика';
    department = 'Бизнес-Аналитика';
    scenarioTitle = 'Формирование сводной аналитической панели';
    aiSummary = 'Собраны метрики, сгруппированы показатели и выгружена итоговая структура отчета.';
  } else if (lower.includes('crm') || lower.includes('клиент') || lower.includes('сделк') || lower.includes('продаж')) {
    category = 'CRM & Продажи';
    department = 'Отдел Продаж & CRM';
    scenarioTitle = 'Анализ клиентских данных и сделок';
    aiSummary = 'Запрошены карточки клиентов, обогащены данные по взаимодействиям и обновлен статус сделки.';
  } else if (lower.includes('код') || lower.includes('python') || lower.includes('sql') || lower.includes('jira') || lower.includes('git')) {
    category = 'Разработка & Кодинг';
    department = 'Разработка & DevOps';
    scenarioTitle = 'Автоматизация кодинга и скриптов';
    aiSummary = 'Сгенерирован и проверен программный фрагмент, оптимизирован запрос и подготовлены автотесты.';
  }

  return { tools, category, department, scenarioTitle, aiSummary };
}

export const RequestFeedView: React.FC<RequestFeedViewProps> = ({
  logs,
  onAddSyntheticPrompt,
  onNavigateToTester,
  onAddCustomLog,
  onDeleteLog,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('ALL');
  const [employeeFilter, setEmployeeFilter] = useState<string>('ALL');
  const [minTokensFilter, setMinTokensFilter] = useState<number>(0);
  const [hasErrorOnly, setHasErrorOnly] = useState<boolean>(false);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Custom Prompt Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [customPromptText, setCustomPromptText] = useState<string>('');
  const [isClassifying, setIsClassifying] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Dynamic date calculations
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayDateFormatted = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  const getLogSavedMinutes = (category: string, status: string): number => {
    if (status !== 'Success') return 0;
    if (category === 'Личный запрос (не по работе)') return 0;
    switch (category) {
      case 'Разработка & Кодинг': return 11;
      case 'Тестирование & QA':
      case 'Отчетность & Аналитика':
      case 'Документооборот & Договоры': return 9;
      case 'CRM & Продажи':
      case 'Коммуникации & Почта':
      case 'HR & Кадры': return 6;
      case 'Инфраструктура & Мониторинг': return 7;
      case 'Поиск & База знаний':
      default: return 5;
    }
  };

  // Unique list of employees
  const uniqueEmployees = Array.from(new Set(logs.map((l) => l.userName))).sort();

  // Count active filters
  const activeFiltersCount =
    (statusFilter !== 'ALL' ? 1 : 0) +
    (categoryFilter !== 'ALL' ? 1 : 0) +
    (departmentFilter !== 'ALL' ? 1 : 0) +
    (dateRangeFilter !== 'ALL' ? 1 : 0) +
    (employeeFilter !== 'ALL' ? 1 : 0) +
    (minTokensFilter > 0 ? 1 : 0) +
    (hasErrorOnly ? 1 : 0);

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setDepartmentFilter('ALL');
    setDateRangeFilter('ALL');
    setEmployeeFilter('ALL');
    setMinTokensFilter(0);
    setHasErrorOnly(false);
    setCurrentPage(1);
  };

  // Handle classification & submission of custom request
  const handleAddCustomRequestSubmit = async () => {
    if (!customPromptText.trim() || isClassifying) return;
    setIsClassifying(true);

    const inferred = inferToolsFromPromptText(customPromptText);
    let newLog: RequestLog;

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: customPromptText }),
      });

      if (response.ok) {
        const data = await response.json();
        newLog = {
          id: `admin-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          promptText: customPromptText,
          userName: 'Администратор',
          userRole: 'Системный Администратор',
          department: (data.department as DepartmentType) || inferred.department,
          category: (data.category as CategoryType) || inferred.category,
          scenarioTitle: data.scenarioTitle || inferred.scenarioTitle,
          status: 'Success',
          tokensUsed: data.tokenCount || Math.max(Math.round(customPromptText.length * 2.5), 1100),
          executionTimeMs: data.executionTimeMs || 850,
          toolsUsed: data.toolsUsed && data.toolsUsed.length > 0 ? data.toolsUsed : inferred.tools,
          aiSummary: data.scenarioDescription || inferred.aiSummary,
        };
      } else {
        throw new Error('API classification error');
      }
    } catch {
      newLog = {
        id: `admin-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        promptText: customPromptText,
        userName: 'Администратор',
        userRole: 'Системный Администратор',
        department: inferred.department,
        category: inferred.category,
        scenarioTitle: inferred.scenarioTitle,
        status: 'Success',
        tokensUsed: Math.max(Math.round(customPromptText.length * 2.5), 1100),
        executionTimeMs: 650,
        toolsUsed: inferred.tools,
        aiSummary: inferred.aiSummary,
      };
    }

    if (onAddCustomLog) {
      onAddCustomLog(newLog);
    }
    setCustomPromptText('');
    setIsClassifying(false);
    setIsAddModalOpen(false);
  };

  // Filtering logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.scenarioTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.errorMessage && log.errorMessage.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesDepartment = departmentFilter === 'ALL' || log.department === departmentFilter;
    const matchesEmployee = employeeFilter === 'ALL' || log.userName === employeeFilter;
    const matchesTokens = minTokensFilter === 0 || log.tokensUsed >= minTokensFilter;
    const matchesError = !hasErrorOnly || log.status === 'Error' || (!!log.errorMessage && log.errorMessage.length > 0);

    let matchesDate = true;
    if (dateRangeFilter === 'TODAY') {
      matchesDate = log.timestamp.startsWith(todayStr);
    } else if (dateRangeFilter === 'WEEK') {
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      matchesDate = log.timestamp.substring(0, 10) >= sevenDaysAgo && log.timestamp.substring(0, 10) <= todayStr;
    } else if (dateRangeFilter === 'MONTH') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      matchesDate = log.timestamp.substring(0, 10) >= firstDayOfMonth && log.timestamp.substring(0, 10) <= todayStr;
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesDepartment &&
      matchesEmployee &&
      matchesTokens &&
      matchesError &&
      matchesDate
    );
  });

  // Calculate paginated slice
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const categoriesList: CategoryType[] = [
    'Поиск & База знаний',
    'Разработка & Кодинг',
    'Отчетность & Аналитика',
    'CRM & Продажи',
    'Документооборот & Договоры',
    'Коммуникации & Почта',
    'Тестирование & QA',
    'HR & Кадры',
    'Инфраструктура & Мониторинг',
    'Личный запрос (не по работе)',
  ];

  const departmentsList: DepartmentType[] = [
    'Разработка & DevOps',
    'Бизнес-Аналитика',
    'Отдел Продаж & CRM',
    'HR & Кадры',
    'Юридический Отдел & Комплаенс',
    'Маркетинг & PR',
    'Финансы & Бухгалтерия',
    'Клиентская Поддержка',
    'Закупки & Логистика',
    'Администрация',
  ];

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Clean Header */}
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Реестр Запросов
          </h1>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Добавить новый запрос</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Поиск по тексту, сотруднику, сценарию или ошибке..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>

        {/* Filters Modal Trigger */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Фильтры</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
              title="Сбросить все фильтры"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200/60">
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Активно:</span>
          {categoryFilter !== 'ALL' && (
            <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-semibold flex items-center space-x-1">
              <span>Категория: {categoryFilter}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-indigo-950" onClick={() => setCategoryFilter('ALL')} />
            </span>
          )}
          {departmentFilter !== 'ALL' && (
            <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-semibold flex items-center space-x-1">
              <span>Отдел: {departmentFilter}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-indigo-950" onClick={() => setDepartmentFilter('ALL')} />
            </span>
          )}
          {statusFilter !== 'ALL' && (
            <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-semibold flex items-center space-x-1">
              <span>Статус: {statusFilter}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-indigo-950" onClick={() => setStatusFilter('ALL')} />
            </span>
          )}
          {dateRangeFilter !== 'ALL' && (
            <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-semibold flex items-center space-x-1">
              <span>Период: {dateRangeFilter === 'TODAY' ? 'Сегодня' : dateRangeFilter === 'WEEK' ? '7 дней' : 'Месяц'}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-indigo-950" onClick={() => setDateRangeFilter('ALL')} />
            </span>
          )}
          {employeeFilter !== 'ALL' && (
            <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-semibold flex items-center space-x-1">
              <span>Автор: {employeeFilter}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-indigo-950" onClick={() => setEmployeeFilter('ALL')} />
            </span>
          )}
          {minTokensFilter > 0 && (
            <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-semibold flex items-center space-x-1">
              <span>Мин. токенов: &gt;{minTokensFilter.toLocaleString('ru-RU')}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-indigo-950" onClick={() => setMinTokensFilter(0)} />
            </span>
          )}
          {hasErrorOnly && (
            <span className="px-2 py-0.5 rounded-lg bg-red-100 text-red-800 font-semibold flex items-center space-x-1">
              <span>Только ошибки</span>
              <X className="w-3 h-3 cursor-pointer hover:text-red-950" onClick={() => setHasErrorOnly(false)} />
            </span>
          )}
        </div>
      )}

      {/* Main Dense Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Top Pagination Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Показано <strong className="text-slate-900">{paginatedLogs.length}</strong> из{' '}
            <strong className="text-slate-900">{filteredLogs.length}</strong> запросов
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-slate-500">На стр:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center space-x-1 font-mono text-[11px]">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-0.5 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                &lt; Назад
              </button>
              <span className="px-2 font-bold">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-0.5 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                Вперед &gt;
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[9px] tracking-wider">
                <th className="py-2 px-2.5">Статус</th>
                <th className="py-2 px-2.5">Дата / Время</th>
                <th className="py-2 px-3">Текст Запроса (Prompt)</th>
                <th className="py-2 px-2.5">Категория</th>
                <th className="py-2 px-2.5">Сотрудник / Отдел</th>
                <th className="py-2 px-2.5">Сервисы</th>
                <th className="py-2 px-2.5 text-right">Токены</th>
                <th className="py-2 px-2.5 text-right">Экономия ФОТ</th>
                <th className="py-2 px-2.5 text-center">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Запросы не найдены. Сбросьте критерии поиска.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isExpanded = expandedRowId === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleRow(log.id)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        {/* Status */}
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              log.status === 'Success'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'Error'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <span>{log.status}</span>
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="py-2 px-2.5 font-mono text-[10px] text-slate-600 whitespace-nowrap font-medium">
                          {log.timestamp}
                        </td>

                        {/* Prompt */}
                        <td className="py-2 px-3 max-w-sm">
                          <span className="font-medium text-slate-900 block truncate" title={log.promptText}>
                            {log.promptText}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100">
                            {log.category}
                          </span>
                        </td>

                        {/* User & Dept */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-xs">{log.userName}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{log.department}</div>
                        </td>

                        {/* Tools */}
                        <td className="py-2 px-2.5 whitespace-nowrap max-w-xs truncate" title={log.toolsUsed.join(', ')}>
                          <span className="text-[10px] font-mono text-slate-600">
                            {log.toolsUsed.join(', ')}
                          </span>
                        </td>

                        {/* Tokens */}
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                          {log.tokensUsed.toLocaleString('ru-RU')}
                        </td>

                        {/* Net FOT Saving */}
                        <td className="py-2 px-2.5 text-right font-mono font-bold whitespace-nowrap">
                          {log.category === 'Личный запрос (не по работе)'
                            ? <span className="text-slate-300">—</span>
                            : <span className="text-emerald-700">{((log as any).moneySavedRubles || getLogSavedMinutes(log.category, log.status) * 30).toLocaleString('ru-RU')} ₽</span>
                          }
                        </td>

                        {/* Action: Delete */}
                        <td className="py-2 px-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onDeleteLog) {
                                onDeleteLog(log.id);
                              }
                            }}
                            title="Удалить запрос"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-y border-slate-200">
                          <td colSpan={9} className="p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <strong className="text-slate-700 block text-[10px] uppercase">
                                  Полный текст запроса:
                                </strong>
                                <p className="text-slate-900 font-mono text-[11px] mt-1">{log.promptText}</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <strong className="text-slate-700 block text-[10px] uppercase">
                                  Ответ / Лог исполнения:
                                </strong>
                                <p className="text-slate-800 text-[11px] mt-1">{log.aiSummary}</p>
                                {log.errorMessage && (
                                  <div className="mt-1 text-red-600 font-mono text-[10px]">
                                    {log.errorMessage}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Custom Request */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">Добавить новый запрос</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Текст запроса или Raw API JSON
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomPromptText(`{\n  "stream": true,\n  "model": "DeepSeek-V4-Flash",\n  "stream_options": { "include_usage": true },\n  "messages": [\n    {\n      "role": "system",\n      "content": "User Context:\\n1. [2026-05-14] user - Сергей\\n\\n"\n    },\n    {\n      "role": "user",\n      "content": "Проанализируй и найди что конкретно требуется по честному знаку"\n    },\n    {\n      "role": "user",\n      "content": "<context>\\n<source id=\\"1\\" name=\\"Тех_задание Т&Т система Честный знак.docx\\">Интеграция с системой Честный знак на уровне Л3...</source>\\n</context>\\n\\n<user_query>\\nа с госсистемой Честный знак какая интеграция и для чего?\\n</user_query>"\n    }\n  ]\n}`)}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    + Вставить тестовый JSON (DeepSeek)
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={customPromptText}
                  onChange={(e) => setCustomPromptText(e.target.value)}
                  placeholder="Введите текст промпта или полный JSON API запрос (stream/messages)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleAddCustomRequestSubmit}
                disabled={!customPromptText.trim() || isClassifying}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                {isClassifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Добавление...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Добавить запрос</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Filters Window */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Фильтры Реестра Запросов</h3>
                  <p className="text-xs text-slate-500">Гибкая настройка параметров выборки вызовов</p>
                </div>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* 1. Category */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Категория запроса</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Все категории</option>
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 2. Department */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Подразделение / Отдел</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Все отделы</option>
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* 3. Status */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Статус вызова</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Все статусы</option>
                  <option value="Success">Успешно (Success)</option>
                  <option value="Error">Сбой / Ошибка (Error)</option>
                  <option value="Warning">Замечание (Warning)</option>
                </select>
              </div>

              {/* 4. Date Range */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Период / Дата</label>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => {
                    setDateRangeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Все время</option>
                  <option value="TODAY">Сегодня ({todayDateFormatted})</option>
                  <option value="WEEK">Последние 7 дней (с {new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' })} по {todayDateFormatted})</option>
                  <option value="MONTH">За текущий месяц ({today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })})</option>
                </select>
              </div>

              {/* 5. Employee / User */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Сотрудник / Автор</label>
                <select
                  value={employeeFilter}
                  onChange={(e) => {
                    setEmployeeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Все сотрудники</option>
                  {uniqueEmployees.map((emp) => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
              </div>

              {/* 6. Minimum Tokens */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Минимум токенов</label>
                <select
                  value={minTokensFilter}
                  onChange={(e) => {
                    setMinTokensFilter(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value={0}>Не ограничено</option>
                  <option value={1000}>Более 1,000 токенов</option>
                  <option value={10000}>Более 10,000 токенов</option>
                  <option value={50000}>Более 50,000 токенов</option>
                  <option value={100000}>Большой контекст (&gt; 100k)</option>
                </select>
              </div>
            </div>

            {/* Checkbox: Error Filter */}
            <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
              <input
                type="checkbox"
                id="errorOnlyCheck"
                checked={hasErrorOnly}
                onChange={(e) => {
                  setHasErrorOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="errorOnlyCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Показывать только запросы с ошибками или замечаниями
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
              >
                Сбросить фильтры
              </button>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                Применить ({filteredLogs.length} найдено)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
