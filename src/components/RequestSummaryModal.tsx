import React, { useState } from 'react';
import { RequestLog, CategoryType } from '../types';
import {
  FileText,
  Mail,
  MessageSquare,
  Sparkles,
  X,
  Send,
  CheckCircle2,
  Calendar,
  Clock,
  Layers,
  Cpu
} from 'lucide-react';

interface RequestSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: RequestLog[];
  onSendToCopilot: (summaryPrompt: string) => void;
}

export const RequestSummaryModal: React.FC<RequestSummaryModalProps> = ({
  isOpen,
  onClose,
  logs,
  onSendToCopilot,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Коммуникации & Почта');
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'messenger' | 'pdf'>('email');
  const [selectedPeriod, setSelectedPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: CategoryType[] = [
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

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedResult(null);

    setTimeout(() => {
      // Filter logs by selected parameters
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
      const errorCount = filtered.filter((l) => l.status === 'Error').length;
      const hoursSaved = (successCount * 0.12).toFixed(1);
      const rublesSaved = Math.round(Number(hoursSaved) * 1500).toLocaleString('ru-RU');

      // Top employees in this category
      const empMap = new Map<string, number>();
      filtered.forEach((l) => empMap.set(l.userName, (empMap.get(l.userName) || 0) + 1));
      const topEmps = Array.from(empMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const periodLabel =
        selectedPeriod === 'TODAY'
          ? 'За 24 июля 2026 г. (Сегодня)'
          : selectedPeriod === 'WEEK'
          ? 'За последние 7 дней'
          : 'За последние 30 дней';

      const channelLabel =
        selectedChannel === 'email'
          ? 'Формат: Email-выжимка'
          : selectedChannel === 'messenger'
          ? 'Формат: Telegram / Slack дайджест'
          : 'Формат: Официальный PDF-отчет';

      const summaryText =
        `📊 ИИ-СВОДКА ЗАПРОСОВ ПО КАТЕГОРИИ "${selectedCategory}"\n` +
        `-----------------------------------------------\n` +
        `📅 Период: ${periodLabel}\n` +
        `📬 ${channelLabel}\n\n` +
        `1. ОСНОВНЫЕ МЕТРИКИ:\n` +
        `• Всего зарегистрировано запросов: ${totalCount} вызовов\n` +
        `• Потреблено токенов: ${totalTokens.toLocaleString('ru-RU')} tok (в среднем ~${avgTokens.toLocaleString('ru-RU')} tok/запрос)\n` +
        `• Успешных обработок: ${successCount} (${totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0}%)\n` +
        `• Зафиксировано сбоев: ${errorCount}\n\n` +
        `2. ЭКОНОМИЧЕСКИЙ ЭФФЕКТ (ROI):\n` +
        `• Экономия рабочего времени сотрудников: ~${hoursSaved} часов\n` +
        `• Эквивалент сэкономленного ФОТ: ~${rublesSaved} ₽\n\n` +
        `3. АКТИВНЫЕ СОТРУДНИКИ В КАТЕГОРИИ:\n` +
        (topEmps.length > 0
          ? topEmps.map(([emp, c]) => `• ${emp} — ${c} запросов`).join('\n')
          : '• За выбранный период активных запросов не зафиксировано.') +
        `\n\n4. ВЫВОДЫ И РЕКОМЕНДАЦИИ:\n` +
        `Сценарии автоматизации в категории "${selectedCategory}" показывают высокую эффективность. Средний объем контекста (~100k токенов) свидетельствует о глубокой обработке документов. Рекомендуется сохранить текущие лимиты.`;

      setGeneratedResult(summaryText);
      setIsGenerating(false);
    }, 700);
  };

  const handleOpenInCopilot = () => {
    if (!generatedResult) return;
    onSendToCopilot(`Проанализируй подробнее следующую сводку по категории "${selectedCategory}":\n\n${generatedResult}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Запросить ИИ-Сводку</h3>
              <p className="text-xs text-slate-500">
                Формирование динамического дайджеста по категории и периоду
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* 1. Category */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Категория</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Все категории</option>
              {categories.map((c) => (
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
              <span>Тип / Канал</span>
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="email">Email-сводка</option>
              <option value="messenger">Telegram / Slack</option>
              <option value="pdf">PDF-отчет</option>
            </select>
          </div>

          {/* 3. Period */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Период</span>
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="TODAY">Сегодня (24 июля)</option>
              <option value="WEEK">За последние 7 дней</option>
              <option value="MONTH">За 30 дней (Все время)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        {!generatedResult && (
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Генерация сводки...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Сформировать ИИ-Сводку</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Generated Result Output */}
        {generatedResult && (
          <div className="space-y-3 pt-2">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto shadow-inner">
              {generatedResult}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setGeneratedResult(null)}
                className="px-3.5 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
              >
                Изменить параметры
              </button>

              <button
                onClick={handleOpenInCopilot}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Отправить в ИИ-Копилот</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
