import React, { useState } from 'react';
import { ScenarioSummary, CategoryType } from '../types';
import { Sparkles, Layers, CheckCircle2, XCircle, Cpu, Clock, Search, ShieldAlert, Lightbulb } from 'lucide-react';

interface ScenarioIntelligenceViewProps {
  scenarios: ScenarioSummary[];
}

export const ScenarioIntelligenceView: React.FC<ScenarioIntelligenceViewProps> = ({ scenarios }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredScenarios = scenarios.filter((sc) => {
    const matchesSearch =
      sc.title.toLowerCase().includes(search.toLowerCase()) ||
      sc.description.toLowerCase().includes(search.toLowerCase()) ||
      sc.department.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || sc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-extrabold text-slate-900">
            ИИ-Сценарии & Групповые Саммари ({scenarios.length} сценариев)
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Автоматическая группировка однотипных пользовательских запросов в устойчивые паттерны использования
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Поиск по названию сценария или описанию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none cursor-pointer"
        >
          <option value="ALL">Все категории сценариев</option>
          {Array.from(new Set(scenarios.map((s) => s.category))).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScenarios.map((scenario) => {
          const successRate = scenario.totalExecutions > 0
            ? Math.round((scenario.successCount / scenario.totalExecutions) * 100)
            : 0;

          return (
            <div
              key={scenario.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                    {scenario.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                    {scenario.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{scenario.department}</p>
                </div>

                <span
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold shrink-0 ${
                    successRate >= 80
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {successRate}% Успех
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-500 block">Вызовов:</span>
                  <span className="text-sm font-extrabold text-slate-900">{scenario.totalExecutions}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Всего токенов:</span>
                  <span className="text-sm font-extrabold text-amber-700">
                    {(scenario.totalTokens / 1000).toFixed(0)}k
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Ср. задержка:</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {(scenario.avgTimeMs / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* AI Key Takeaway */}
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start space-x-2.5">
                <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-900 text-[10px] uppercase tracking-wider block">
                    Вывод ИИ-Аналитики:
                  </span>
                  <p className="text-xs text-indigo-950 font-medium leading-relaxed mt-0.5">
                    {scenario.aiKeyTakeaway}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
