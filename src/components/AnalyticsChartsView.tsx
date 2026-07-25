import React, { useState, useMemo } from 'react';
import { RequestLog } from '../types';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsChartsViewProps {
  logs: RequestLog[];
}

export const AnalyticsChartsView: React.FC<AnalyticsChartsViewProps> = ({ logs }) => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('month');

  // Dynamic timeframe aggregation
  const dynamicChartData = useMemo(() => {
    if (timeframe === 'day') {
      const hourlyMap = new Map<string, { requests: number; tokensK: number }>();
      const hoursList = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
      hoursList.forEach((h) => hourlyMap.set(h, { requests: 0, tokensK: 0 }));

      const latestDay = new Date().toISOString().split('T')[0];
      const dayLogs = logs.filter((l) => l.timestamp.startsWith(latestDay));

      dayLogs.forEach((l) => {
        const hourStr = l.timestamp.substring(11, 13) + ':00';
        const current = hourlyMap.get(hourStr) || { requests: 0, tokensK: 0 };
        hourlyMap.set(hourStr, {
          requests: current.requests + 1,
          tokensK: current.tokensK + Math.round(l.tokensUsed / 1000),
        });
      });

      return Array.from(hourlyMap.entries()).map(([time, val]) => ({
        time,
        requests: val.requests,
        tokensK: val.tokensK,
      }));
    }

    if (timeframe === 'week') {
      const weekMap = new Map<string, { requests: number; tokensK: number }>();
      const dates = Array.from(new Set(logs.map((l) => l.timestamp.substring(0, 10)))).sort().slice(-7);
      dates.forEach((d) => {
        const label = d.substring(8, 10) + '.' + d.substring(5, 7);
        weekMap.set(label, { requests: 0, tokensK: 0 });
      });

      logs.forEach((l) => {
        const d = l.timestamp.substring(0, 10);
        if (dates.includes(d)) {
          const label = d.substring(8, 10) + '.' + d.substring(5, 7);
          const current = weekMap.get(label) || { requests: 0, tokensK: 0 };
          weekMap.set(label, {
            requests: current.requests + 1,
            tokensK: current.tokensK + Math.round(l.tokensUsed / 1000),
          });
        }
      });

      return Array.from(weekMap.entries()).map(([time, val]) => ({
        time,
        requests: val.requests,
        tokensK: val.tokensK,
      }));
    }

    // Month
    const monthMap = new Map<string, { requests: number; tokensK: number }>();
    const dates = Array.from(new Set(logs.map((l) => l.timestamp.substring(0, 10)))).sort();
    const bucketCount = 6;
    const bucketSize = Math.max(1, Math.ceil(dates.length / bucketCount));

    for (let i = 0; i < dates.length; i += bucketSize) {
      const chunk = dates.slice(i, i + bucketSize);
      const firstDate = chunk[0].substring(8, 10) + '.' + chunk[0].substring(5, 7);
      const lastDate = chunk[chunk.length - 1].substring(8, 10) + '.' + chunk[chunk.length - 1].substring(5, 7);
      const label = chunk.length > 1 ? `${firstDate}-${lastDate}` : firstDate;

      let requests = 0;
      let tokensK = 0;

      logs.forEach((l) => {
        const d = l.timestamp.substring(0, 10);
        if (chunk.includes(d)) {
          requests += 1;
          tokensK += Math.round(l.tokensUsed / 1000);
        }
      });

      monthMap.set(label, { requests, tokensK });
    }

    return Array.from(monthMap.entries()).map(([time, val]) => ({
      time,
      requests: val.requests,
      tokensK: val.tokensK,
    }));
  }, [logs, timeframe]);

  // 1. Requests by Category
  const categoryMap = new Map<string, number>();
  logs.forEach((l) => {
    categoryMap.set(l.category, (categoryMap.get(l.category) || 0) + 1);
  });
  const categoryData = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // 2. Tokens by Department
  const deptTokensMap = new Map<string, number>();
  logs.forEach((l) => {
    deptTokensMap.set(l.department, (deptTokensMap.get(l.department) || 0) + l.tokensUsed);
  });
  const deptTokensData = Array.from(deptTokensMap.entries())
    .map(([department, tokens]) => ({
      department,
      tokensM: Number((tokens / 1000000).toFixed(2)),
    }))
    .sort((a, b) => b.tokensM - a.tokensM);

  // Realistic time savings logic based on task complexity (in hours)
  const getLogSavedHours = (category: string, status: string): number => {
    if (status !== 'Success') return 0;
    if (category === 'Личный запрос (не по работе)') return 0;
    switch (category) {
      case 'Разработка & Кодинг':
        return 0.18; // ~11 min
      case 'Тестирование & QA':
      case 'Отчетность & Аналитика':
      case 'Документооборот & Договоры':
        return 0.15; // ~9 min
      case 'CRM & Продажи':
      case 'Коммуникации & Почта':
      case 'HR & Кадры':
        return 0.10; // ~6 min
      case 'Инфраструктура & Мониторинг':
        return 0.12; // ~7 min
      case 'Поиск & База знаний':
      default:
        return 0.08; // ~5 min
    }
  };

  // 3. Department Economy & Time Saved
  const deptEconomyMap = new Map<string, { requests: number; tokens: number; savedHours: number; grossRubles: number; netRubles: number }>();
  logs.forEach((l) => {
    const current = deptEconomyMap.get(l.department) || { requests: 0, tokens: 0, savedHours: 0, grossRubles: 0, netRubles: 0 };
    const savedForLog = getLogSavedHours(l.category, l.status);
    const gross = l.grossMoneySavedRubles || Math.round(savedForLog * 1800);
    const net = l.moneySavedRubles || Math.round(savedForLog * 1800);
    deptEconomyMap.set(l.department, {
      requests: current.requests + 1,
      tokens: current.tokens + l.tokensUsed,
      savedHours: current.savedHours + savedForLog,
      grossRubles: current.grossRubles + gross,
      netRubles: current.netRubles + net,
    });
  });

  const deptEconomyData = Array.from(deptEconomyMap.entries()).map(([dept, val]) => {
    const hoursFixed = Number(val.savedHours.toFixed(1));
    return {
      department: dept,
      requests: val.requests,
      tokensM: (val.tokens / 1000000).toFixed(2),
      savedHours: hoursFixed,
      rublesSaved: val.netRubles,
      grossRubles: val.grossRubles,
      netRubles: val.netRubles,
    };
  }).sort((a, b) => b.savedHours - a.savedHours);

  const totalSavedHours = Number(deptEconomyData.reduce((acc, d) => acc + d.savedHours, 0).toFixed(1));
  const totalGrossRubles = deptEconomyData.reduce((acc, d) => acc + d.grossRubles, 0);
  const totalNetRubles = deptEconomyData.reduce((acc, d) => acc + d.netRubles, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">
          Аналитика & Диаграммы
        </h1>
      </div>

      {/* Main Dynamic Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Динамика запросов и объема токенов
          </h2>

          {/* Timeframe Switcher Buttons */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {(
              [
                { id: 'day', label: 'За День' },
                { id: 'week', label: 'За Неделю' },
                { id: 'month', label: 'За Месяц' },
              ] as const
            ).map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeframe === tf.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorTok" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', fontSize: '12px' }}
                formatter={(val: any, name: any) => [
                  name === 'requests' ? `${val} запросов` : `${val}k токенов`,
                  name === 'requests' ? 'Запросы' : 'Токены'
                ]}
              />
              <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReq)" />
              <Area type="monotone" dataKey="tokensK" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTok)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid 2: Category Distribution & Token Consumption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Частота ИИ-Запросов по Категориям
            </h2>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} вызовов`, 'Количество']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tokens by Department */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Потребление Токенов по Подразделениям (Млн токенов)
            </h2>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptTokensData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`${val}M токенов`, 'Объем']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', fontSize: '12px' }}
                />
                <Bar dataKey="tokensM" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Economic Effect & Time Savings Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Экономический Эффект & Экономия Рабочего Времени
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Оценка выгоды от автоматизации задач на основе аналитики запросов
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <div>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Сэкономлено времени:</span>
              <span className="text-sm font-bold text-emerald-800 font-mono">{totalSavedHours} ч.</span>
            </div>
            <div className="h-6 w-px bg-emerald-200" />
            <div>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Чистый ФОТ:</span>
              <span className="text-sm font-bold text-emerald-800 font-mono">~{totalNetRubles.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2 px-3">Подразделение</th>
                <th className="py-2 px-3 text-center">Вызовов</th>
                <th className="py-2 px-3 text-center">Расход Токенов</th>
                <th className="py-2 px-3 text-center">Сэкономлено Времени</th>
                <th className="py-2 px-3 text-right">Грязный ФОТ (₽)</th>
                <th className="py-2 px-3 text-right">Чистый ФОТ (₽)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptEconomyData.map((item) => (
                <tr key={item.department} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.department}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-700">{item.requests}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-700">{item.tokensM}M</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">{item.savedHours} ч.</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-500">~{item.grossRubles.toLocaleString('ru-RU')} ₽</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">~{item.netRubles.toLocaleString('ru-RU')} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
