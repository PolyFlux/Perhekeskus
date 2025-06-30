import React from 'react';
import { CheckSquare, PiggyBank, UtensilsCrossed, Clock, AlertCircle, Calendar } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
  // Lisätään propsit dynaamisille tiedoille
  todayTasks: any[];
  budgetRemaining: number;
  todayMeals: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, todayTasks, budgetRemaining, todayMeals }) => {
  // Laske tämän päivän tehtävät
  const getTodayTasksCount = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    return todayTasks.filter(task => {
      if (task.type === 'daily') return true;
      if (task.type === 'weekly') return true;
      if (task.type === 'specific' && task.dueDate === todayString) return true;
      return false;
    }).filter(task => !task.completed).length;
  };

  // Formatoi budjetti
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Hae tämän päivän ateriat
  const getTodayMealsText = () => {
    if (todayMeals.length === 0) {
      return 'Ei suunniteltuja aterioita';
    }
    
    const mealNames = todayMeals.map(meal => meal.name).join(', ');
    return mealNames.length > 50 ? mealNames.substring(0, 50) + '...' : mealNames;
  };

  const quickStats = [
    { 
      label: 'Tehtäviä tänään', 
      value: getTodayTasksCount().toString(), 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      icon: CheckSquare,
      onClick: () => onNavigate('todos')
    },
    { 
      label: 'Budjetti jäljellä', 
      value: formatCurrency(budgetRemaining), 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50',
      icon: PiggyBank,
      onClick: () => onNavigate('budget')
    },
    { 
      label: 'Tämän päivän ruokalista', 
      value: getTodayMealsText(), 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-50',
      icon: UtensilsCrossed,
      onClick: () => onNavigate('meals'),
      isText: true
    },
  ];

  // Hae tärkeimmät tehtävät tänään
  const getImportantTodayTasks = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    return todayTasks
      .filter(task => {
        if (task.completed) return false;
        if (task.type === 'daily') return true;
        if (task.type === 'weekly') return true;
        if (task.type === 'specific' && task.dueDate === todayString) return true;
        return false;
      })
      .filter(task => task.priority === 'high' || task.priority === 'medium')
      .slice(0, 5);
  };

  const importantTasks = getImportantTodayTasks();

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

      {/* Dynaamiset tilastot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <button
              key={index}
              onClick={stat.onClick}
              className={`${stat.bgColor} rounded-xl p-6 border border-slate-200/50 transition-all duration-200 hover:scale-105 hover:shadow-lg text-left group`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`${stat.color} ${stat.bgColor} p-2 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-medium text-slate-600">
                      {stat.label}
                    </div>
                  </div>
                  <div className={`${stat.isText ? 'text-lg' : 'text-2xl'} font-bold ${stat.color} ${stat.isText ? 'leading-tight' : ''}`}>
                    {stat.value}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tämän päivän tärkeät tehtävät */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span>Tämän päivän tärkeät tehtävät</span>
          </h3>
          <button
            onClick={() => onNavigate('todos')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
          >
            Näytä kaikki tehtävät →
          </button>
        </div>
        
        {importantTasks.length > 0 ? (
          <div className="space-y-3">
            {importantTasks.map((task, index) => (
              <div
                key={task.id || index}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-red-400' : 
                    task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{task.name}</div>
                    <div className="text-sm text-slate-600 flex items-center space-x-2">
                      <span className="capitalize">{task.category}</span>
                      {task.assignedTo && task.assignedTo.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{task.assignedTo.join(', ')}</span>
                        </>
                      )}
                      {task.type === 'specific' && task.dueDate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString('fi-FI')}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {task.type === 'daily' && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Päivittäin
                    </span>
                  )}
                  {task.type === 'weekly' && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Viikoittain
                    </span>
                  )}
                  {task.priority === 'high' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <CheckSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Ei tärkeitä tehtäviä tänään</p>
            <button
              onClick={() => onNavigate('todos')}
              className="text-blue-600 hover:text-blue-700 text-sm mt-2 transition-colors duration-200"
            >
              Lisää tehtäviä
            </button>
          </div>
        )}
      </div>

      {/* Tämän päivän ateriat */}
      {todayMeals.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
              <UtensilsCrossed className="h-5 w-5 text-orange-600" />
              <span>Tämän päivän ateriat</span>
            </h3>
            <button
              onClick={() => onNavigate('meals')}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200"
            >
              Avaa ruokasuunnittelu →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayMeals.map((meal, index) => (
              <div
                key={meal.id || index}
                className="bg-orange-50 rounded-lg p-4 border border-orange-200/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-800">{meal.name}</h4>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full capitalize">
                    {meal.type === 'breakfast' ? 'Aamiainen' :
                     meal.type === 'lunch' ? 'Lounas' :
                     meal.type === 'dinner' ? 'Päivällinen' :
                     meal.type === 'snack' ? 'Välipala' : 'Iltapala'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-slate-600 mb-2">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{meal.prepTime} min</span>
                </div>
                <div className="text-xs text-slate-600">
                  {meal.ingredients.slice(0, 3).join(', ')}
                  {meal.ingredients.length > 3 && '...'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;