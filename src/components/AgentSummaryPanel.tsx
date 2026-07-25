import React, { useState } from 'react';
import { RequestLog, CategoryType } from '../types';
import {
  Sparkles,
  Layers,
  Mail,
  Calendar,
  Send,
  Copy,
  Check,
  TrendingUp,
  Clock,
  Coins,
  Users,
  ShieldCheck,
  FileText,
  Share2
} from 'lucide-react';

interface AgentSummaryPanelProps {
  logs: RequestLog[];
  onSendToCopilot: (summaryPrompt: string) => void;
}

export const AgentSummaryPanel: React.FC<AgentSummaryPanelProps> = ({
  logs,
  onSendToCopilot,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Коммуникации & Почта');
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'messenger' | 'pdf'>('email');
  const [selectedPeriod, setSelectedPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH'>('MONTH');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Pre-generate default report or generate on demand
  const [reportData, setReportData] = useState<{
    totalCount: number;
    totalTokens: number;
    avgTokens: number;
    successRate: number;
    hoursSaved: number;
    rublesSaved: number;
    topEmployees: { name: string; count: number; department: string }[];
    topScenarios: { title: string; count: number }[];
    executiveText: string;
  } | null>(null);

  const categoriesList: CategoryType[] = [
    'Коммуникации & Почта',
    'Документооборот & Договоры',
    'Разработка & Кодинг',
    'Инфраструктура & Мониторинг',
    'HR & Кадры',
    'Поиск & База знаний',
    'Отчетность & Аналитика',
    'CRM & Продажи',
    'Тестирование & QA',
  ];

  const handleGenerateSummary = () => {
    setIsGenerating(true);

    setTimeout(() => {
      // Filter logs
      const filtered = logs.filter((l) => {
        const matchesCategory = selectedCategory === 'ALL' || l.category === selectedCategory;

        let matchesDate = true;
        if (selectedPeriod === 'TODAY') {
          matchesDate = l.timestamp.startsWith('2026-07-25');
        } else if (selectedPeriod === 'WEEK') {
          matchesDate = l.timestamp >= '2026-07-17';
        } else if (selectedPeriod === 'MONTH') {
          matchesDate = l.timestamp >= '2026-07-01';
        }

        return matchesCategory && matchesDate;
      });

      const totalCount = filtered.length;
      const totalTokens = filtered.reduce((acc, l) => acc + l.tokensUsed, 0);
      const avgTokens = totalCount > 0 ? Math.round(totalTokens / totalCount) : 0;
      const successCount = filtered.filter((l) => l.status === 'Success').length;
      const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 100;
      const hoursSaved = Number((totalCount * 0.14).toFixed(1));
      const rublesSaved = Math.round(hoursSaved * 1500);

      // Map employees
      const empMap = new Map<string, { count: number; dept: string }>();
      filtered.forEach((l) => {
        const existing = empMap.get(l.userName) || { count: 0, dept: l.department };
        empMap.set(l.userName, { count: existing.count + 1, dept: l.department });
      });
      const topEmployees = Array.from(empMap.entries())
        .map(([name, val]) => ({ name, count: val.count, department: val.dept }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      // Map scenarios
      const scMap = new Map<string, number>();
      filtered.forEach((l) => scMap.set(l.scenarioTitle, (scMap.get(l.scenarioTitle) || 0) + 1));
      const topScenarios = Array.from(scMap.entries())
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const periodTitle =
        selectedPeriod === 'TODAY' ? '24 июля 2026 г. (Сегодня)' : selectedPeriod === 'WEEK' ? 'Последние 7 дней' : 'За 30 дней';

      const executiveText =
        `Исполнительный отчет по категории "${selectedCategory}" (${periodTitle}):\n` +
        `Всего вызовов: ${totalCount}, суммарно потреблено ${totalTokens.toLocaleString('ru-RU')} токенов (в среднем ~${avgTokens.toLocaleString('ru-RU')} tok/запрос).\n` +
        `Эффективность успешного выполнения составляет ${successRate}%. Прямая экономия рабочего времени персонала: ~${hoursSaved} часов (эквивалент ${rublesSaved.toLocaleString('ru-RU')} ₽ ФОТ).\n\n` +
        `Ключевые авторы вызовов: ${topEmployees.map((e) => `${e.name} (${e.count} запр.)`).join(', ')}.`;

      setReportData({
        totalCount,
        totalTokens,
        avgTokens,
        successRate,
        hoursSaved,
        rublesSaved,
        topEmployees,
        topScenarios,
        executiveText,
      });

      setIsGenerating(false);
    }, 450);
  };

  // Run on mount once
  React.useEffect(() => {
    handleGenerateSummary();
  }, []);

  const handleCopy = () => {
    if (!reportData) return;
    navigator.clipboard.writeText(reportData.executiveText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendCopilot = () => {
    if (!reportData) return;
    onSendToCopilot(
      `Проанализируй подробную ИИ-сводку эффективности по категории "${selectedCategory}":\n\n${reportData.executiveText}`
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold tracking-tight">
              Центр Формирования ИИ-Сводок и Анализа Эффективности
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Автоматическое извлечение бизнес-метрик, токеномики и реального эффекта от использования ИИ-агентов без перегруженного кода
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-200 text-xs font-semibold flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Динамический Расчет ROI</span>
          </span>
        </div>
      </div>

      {/* Broad Controls Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. Category */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Категория Агентов</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="ALL">Все категории (Общий дайджест)</option>
              {categoriesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Channel / Format */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>Формат Выгрузки</span>
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="email">Email-выжимка (Для руководства)</option>
              <option value="messenger">Telegram / Slack дайджест</option>
              <option value="pdf">Исполнительный PDF-отчет</option>
            </select>
          </div>

          {/* 3. Period */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Анализируемый Период</span>
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="TODAY">Сегодня (25 июля 2026 г.)</option>
              <option value="WEEK">За последние 7 дней</option>
              <option value="MONTH">За 30 дней (Полная выборка)</option>
            </select>
          </div>

          {/* 4. Action Button */}
          <div className="space-y-1 flex flex-col justify-end">
            <button
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center space-x-2 h-[38px]"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Расчет аналитики...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Сформировать Сводку</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report Spacious Container */}
      {reportData && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Executive Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Metric 1 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Вызовов ИИ</span>
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {reportData.totalCount} <span className="text-xs text-slate-500 font-sans font-normal">запросов</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-bold">
                {reportData.successRate}% успешных ответов
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Объем Токенов</span>
                <Coins className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-extrabold text-amber-800 font-mono">
                {(reportData.totalTokens / 1000000).toFixed(2)}M <span className="text-xs text-slate-500 font-sans font-normal">tok</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                ~{reportData.avgTokens.toLocaleString('ru-RU')} tok/контекст
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Сэкономлено времени</span>
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="text-xl font-extrabold text-indigo-900 font-mono">
                ~{reportData.hoursSaved} <span className="text-xs text-slate-500 font-sans font-normal">часов</span>
              </div>
              <div className="text-[10px] text-indigo-600 font-bold">
                Освобождение рутины
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Эквивалент ФОТ</span>
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-extrabold text-emerald-800 font-mono">
                ~{reportData.rublesSaved.toLocaleString('ru-RU')} <span className="text-xs text-slate-500 font-sans font-normal">₽</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-bold">
                Прямая экономия затрат
              </div>
            </div>
          </div>

          {/* Detailed Executive Briefing Document Card */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-5 shadow-inner text-xs">
            {/* Header badge */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="font-extrabold uppercase tracking-wider text-slate-200">
                  Официальная ИИ-Выжимка по Направлению: {selectedCategory}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                {selectedChannel === 'email' ? 'Email Digest' : selectedChannel === 'messenger' ? 'Telegram / Slack' : 'PDF Report'}
              </span>
            </div>

            {/* Formatted Content */}
            <div className="space-y-4 font-sans leading-relaxed text-slate-200">
              {/* Section 1 */}
              <div className="space-y-1">
                <div className="font-bold text-indigo-300 uppercase tracking-wide text-[11px]">
                  1. Эффективность и Бизнес-Ценность
                </div>
                <p className="text-slate-300 text-xs">
                  За выбранный период по категории <strong className="text-white">"{selectedCategory}"</strong> зарегистрировано{' '}
                  <strong className="text-white">{reportData.totalCount} вызовов</strong>. Агенты успешно оптимизировали рутинные операции, высвободив <strong className="text-emerald-300">~{reportData.hoursSaved} рабочих часов</strong> высококвалифицированных специалистов.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-1">
                <div className="font-bold text-indigo-300 uppercase tracking-wide text-[11px]">
                  2. Токеномика и Контекст
                </div>
                <p className="text-slate-300 text-xs">
                  Суммарный расход токенов составил <strong className="text-amber-300">{reportData.totalTokens.toLocaleString('ru-RU')} tok</strong>. Высокий средний размер контекста (<strong className="text-white">~{reportData.avgTokens.toLocaleString('ru-RU')} токенов на запрос</strong>) подтверждает глубокую работу модели с масштабными техническими заданиями и нормативными документами без поверхностных заготовок.
                </p>
              </div>

              {/* Section 3 */}
              {reportData.topEmployees.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-indigo-300 uppercase tracking-wide text-[11px]">
                    3. Активные Пользователи и Лидеры Направления
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {reportData.topEmployees.map((emp) => (
                      <div key={emp.name} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-[11px]">{emp.name}</div>
                          <div className="text-[10px] text-slate-400">{emp.department}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px]">
                          {emp.count} запр.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4 */}
              {reportData.topScenarios.length > 0 && (
                <div className="space-y-1">
                  <div className="font-bold text-indigo-300 uppercase tracking-wide text-[11px]">
                    4. Популярные Сценарии Взаимодействия
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {reportData.topScenarios.map((sc) => (
                      <li key={sc.title}>
                        <strong className="text-white">{sc.title}</strong> — {sc.count} исполнений.
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Panel Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copied ? 'Скопировано!' : 'Скопировать отчет'}</span>
                </button>
              </div>

              <button
                onClick={handleSendCopilot}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Задать вопросы ИИ-Копилоту по отчету</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
