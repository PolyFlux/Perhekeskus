import React from 'react';
import { Calendar, CheckSquare, UtensilsCrossed, List, PiggyBank, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const quickStats = [
    { label: 'Tehtäviä tänään', value: '7', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Tulevia tapahtumia', value: '3', color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Budjetti jäljellä', value: '1 240€', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Aktiivisia listoja', value: '5', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  const quickActions = [
    {
      title: 'Kalenteri',
      description: 'Katso ja hallinnoi perheen tapahtumia',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      action: () => onNavigate('calendar'),
    },
    {
      title: 'Tehtävälistat',
      description: 'Hallinnoi päivittäisiä tehtäviä perheenjäsenille',
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      action: () => onNavigate('todos'),
    },
    {
      title: 'Ruokasuunnittelu',
      description: 'Suunnittele viikon ateriat ja ostokset',
      icon: UtensilsCrossed,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      action: () => onNavigate('meals'),
    },
    {
      title: 'Listat',
      description: 'Ostoslistat, pakkauslistat ja muut listat',
      icon: List,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      action: () => onNavigate('lists'),
    },
    {
      title: 'Budjetti',
      description: 'Seuraa menoja ja säästötavoitteita',
      icon: PiggyBank,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      hoverColor: 'hover:bg-pink-100',
      action: () => onNavigate('budget'),
    },
  ];

  const upcomingTasks = [
    { title: 'Ruokaostokset', person: 'Äiti', time: '14:00', priority: 'high' },
    { title: 'Hae kuivapesu', person: 'Isi', time: '16:30', priority: 'medium' },
    { title: 'Jalkapalloharjoitukset', person: 'Perhe', time: '18:00', priority: 'high' },
  ];

  return (
    <div className="space-y-8">
      {/* Tervetuloa-osio */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Tervetuloa perhekeskukseen
        </h2>
        <p className="text-slate-600 text-lg">
          Kaikki mitä tarvitset perheen järjestämiseen yhdessä paikassa
        </p>
      </div>

      {/* Pikatilastot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-6 border border-slate-200/50 transition-transform duration-200 hover:scale-105`}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-slate-600 font-medium">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pikatoiminnot */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-6">Pikatoiminnot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`${action.bgColor} ${action.hoverColor} rounded-xl p-6 border border-slate-200/50 text-left transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`${action.color} ${action.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 mb-1">
                      {action.title}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tämän päivän tehtävät */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800">Tämän päivän tärkeät tehtävät</h3>
          <button
            onClick={() => onNavigate('todos')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
          >
            Näytä kaikki tehtävät →
          </button>
        </div>
        <div className="space-y-3">
          {upcomingTasks.map((task, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  task.priority === 'high' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
                <div>
                  <div className="font-medium text-slate-800">{task.title}</div>
                  <div className="text-sm text-slate-600">{task.person}</div>
                </div>
              </div>
              <div className="text-sm text-slate-600 font-medium">
                {task.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;