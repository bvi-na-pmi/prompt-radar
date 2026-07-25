import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

interface FinancialConfig {
  fixedMonthlyCosts: number;
  devTeamMonthlyCost: number;
  electricityMonthlyCost: number;
  fteCostPerMinute: number;
}

export const SettingsView: React.FC = () => {
  const [costs, setCosts] = useState<FinancialConfig>({
    fixedMonthlyCosts: 0,
    devTeamMonthlyCost: 0,
    electricityMonthlyCost: 0,
    fteCostPerMinute: 0
  });

  useEffect(() => {
    // Fetch current settings from backend on component mount
    fetch('/api/settings/financial')
      .then(res => res.json())
      .then(data => setCosts(data))
      .catch(err => console.error('Failed to fetch financial settings:', err));
  }, []);

  const handleSave = () => {
    fetch('/api/settings/financial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(costs),
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          alert('Настройки сохранены!');
        } else {
          alert('Ошибка при сохранении настроек.');
        }
      })
      .catch(err => console.error('Failed to save financial settings:', err));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs max-w-2xl mx-auto mt-6">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Финансовые настройки системы</h2>
      <div className="space-y-4">
        {[
          { key: 'fixedMonthlyCosts', label: 'Амортизация сервера (мес, ₽)' },
          { key: 'devTeamMonthlyCost', label: 'ЗП команды разработки (мес, ₽)' },
          { key: 'electricityMonthlyCost', label: 'Электричество (мес, ₽)' },
          { key: 'fteCostPerMinute', label: 'Стоимость 1 мин. FTE (₽)' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">{item.label}</label>
            <input
              type="number"
              value={costs[item.key as keyof typeof costs]}
              onChange={(e) => setCosts({ ...costs, [item.key]: Number(e.target.value) })}
              className="w-40 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="mt-8 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 flex items-center space-x-2"
      >
        <Save className="w-4 h-4" />
        <span>Сохранить настройки</span>
      </button>
    </div>
  );
};
