import React, { useState } from 'react';
import { RequestLog } from '../types';
import { Terminal, Send, Sparkles, CheckCircle2, AlertTriangle, XCircle, Cpu, Clock, Layers, ArrowRight } from 'lucide-react';

interface LivePromptTesterProps {
  onAddLog: (newLog: RequestLog) => void;
}

const SAMPLE_PROMPTS = [
  'Проверь корпоративную почту за прошедший день, найди письма от бухгалтерии про сверку НДС и создай задачу в Bitrix24',
  'Напиши PostgreSQL запрос для генерации воронки конверсии из клика в покупку с разбивкой по UTM-меткам',
  'Проверь выгруженный файл договоров в формате docx на соответствие стандартному шаблону юротдела',
  'Сделай краткое резюме встреч топ-менеджмента из Яндекс Телемост за прошлый вторник',
];

export const LivePromptTester: React.FC<LivePromptTesterProps> = ({ onAddLog }) => {
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<RequestLog | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClassify = async (overridePrompt?: string) => {
    const textToSubmit = overridePrompt || promptText;
    if (!textToSubmit.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setLastResult(null);

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: textToSubmit }),
      });

      if (!response.ok) {
        throw new Error('Ошибка связи с сервером классификации');
      }

      const data = await response.json();

      const newLogItem: RequestLog = {
        id: data.id || `req-live-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        promptText: textToSubmit,
        userName: 'Пользователь (Тест)',
        userRole: 'Сотрудник',
        department: data.department || 'Управление & Руководство',
        category: data.category || 'Поиск & База знаний',
        scenarioTitle: data.scenarioTitle || 'Случайный запуск',
        status: data.status || 'Success',
        tokensUsed: data.tokenCount || Math.round(textToSubmit.length / 2) + 500,
        executionTimeMs: data.executionTimeMs || 850,
        toolsUsed: ['Gemini Classifier API', 'Parser Tool'],
        aiSummary: data.scenarioDescription || `Авто-классифицирован сценарий "${data.scenarioTitle}"`,
        errorMessage: data.status === 'Error' ? 'Обнаружены ошибки исполнения или контекста' : undefined,
      };

      setLastResult(newLogItem);
      onAddLog(newLogItem);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ошибка обработки промпта');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-extrabold text-slate-900">
            Лаборатория Живой ИИ-Классификации Промптов
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Введите любой произвольный текст запроса сотрудника, чтобы запустить классификатор ИИ в реальном времени
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Form Input */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Введите произвольный текст пользовательского промпта:
          </label>

          <textarea
            rows={5}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Например: Собери из Jira все критические баги за прошлую неделю, подготовь отчёт в Excel и пришли в Slack..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono resize-none"
          />

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] text-slate-500 font-semibold block">
              Быстрые примеры запросов:
            </span>
            <div className="space-y-1.5">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPromptText(sample);
                    handleClassify(sample);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-[11px] text-slate-700 hover:text-indigo-900 border border-slate-200 hover:border-indigo-200 transition-all font-medium truncate"
                >
                  &rarr; "{sample}"
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleClassify()}
            disabled={isLoading || !promptText.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>ИИ анализирует запрос...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Запустить Классификатор ИИ</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Live Output Result */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Результат ИИ-Анализа в Реальном Времени
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Engine: Gemini 2.0</span>
            </div>

            {lastResult ? (
              <div className="mt-4 space-y-3 text-xs">
                {/* Category & Status */}
                <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Назначенная Категория:</span>
                    <span className="text-sm font-extrabold text-indigo-400">
                      {lastResult.category}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      lastResult.status === 'Success'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {lastResult.status === 'Success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{lastResult.status}</span>
                  </span>
                </div>

                {/* Scenario Title */}
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Сценарий использования:</span>
                  <span className="text-xs font-bold text-white block">
                    {lastResult.scenarioTitle}
                  </span>
                  <p className="text-[11px] text-slate-300">
                    {lastResult.aiSummary}
                  </p>
                </div>

                {/* Dept & Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px]">Подразделение:</span>
                    <span className="font-bold text-slate-200">{lastResult.department}</span>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px]">Расчет токенов:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {lastResult.tokensUsed.toLocaleString('ru-RU')} tk
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Terminal className="w-10 h-10 text-slate-700 mb-2" />
                <p className="text-xs">
                  Введите текст промпта слева и нажмите "Запустить Классификатор ИИ". Результат мгновенно добавится в общую аналитику!
                </p>
              </div>
            )}
          </div>

          {lastResult && (
            <div className="pt-3 border-t border-slate-800 text-center">
              <span className="text-[11px] text-emerald-400 font-medium flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Запрос автоматически сохранён в общем реестре</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
