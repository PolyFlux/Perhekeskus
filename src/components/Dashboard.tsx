import React from 'react';
import { CheckSquare, PiggyBank, UtensilsCrossed, Clock, AlertCircle, Calendar, User } from 'lucide-react';

interface Task {
  id: number;
  name: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  type: 'daily' | 'weekly' | 'specific' | 'anytime';
  assignedTo: string[];
  dueDate?: string;
  description?: string;
  createdAt: Date;
}

interface DashboardProps {
  onNavigate: (view: string) => void;
  todayTasks: Task[];
  budgetRemaining: number;
  todayMeals: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, todayTasks, budgetRemaining, todayMeals }) => {
  // Laske tämän päivän tehtävät henkilöittäin
  const getTodayTasksByPerson = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const todayTasksFiltered = todayTasks.filter(task => {
      if (task.completed) return false;
      if (task.type === 'daily') return true;
      if (task.type === 'weekly') return true;
      if (task.type === 'specific' && task.dueDate === todayString) return true;
      return false;
    });

    // Ryhmittele tehtävät henkilöittäin - jokainen henkilö lasketaan erikseen
    const tasksByPerson: { [person: string]: Task[] } = {};
    
    todayTasksFiltered.forEach(task => {
      task.assignedTo.forEach((person: string) => {
        // Ohita "Kuka tahansa" ja "Perhe" -merkinnät
        if (person === 'Kuka tahansa' || person === 'Perhe') {
          return;
        }
        
        if (!tasksByPerson[person]) {
          tasksByPerson[person] = [];
        }
        tasksByPerson[person].push(task);
      });
    });

    return tasksByPerson;
  };

  // Formatoi budjetti
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Hae tämän päivän lounas ja päivällinen
  const getTodayMainMealsText = () => {
    const mainMeals = todayMeals.filter(meal => 
      meal.type === 'lunch' || meal.type === 'dinner'
    );
    
    if (mainMeals.length === 0) {
      return 'Ei suunniteltuja aterioita';
    }
    
    const mealTexts = mainMeals.map(meal => {
      const typeLabel = meal.type === 'lunch' ? 'Lounas' : 'Päivällinen';
      return `${typeLabel}: ${meal.name}`;
    });
    
    return mealTexts.join(' • ');
  };

  const tasksByPerson = getTodayTasksByPerson();

  const quickStats = [
    { 
      label: 'Tehtäviä tänään', 
      value: '', // Erikoisarvo tehtäville
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      icon: CheckSquare,
      onClick: () => onNavigate('todos'),
      isTaskWidget: true
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
      value: getTodayMainMealsText(), 
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

      {/* Pikatilastot */}
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
                  
                  {stat.isTaskWidget ? (
                    // Tehtävät henkilöittäin
                    <div className="space-y-2">
                      {Object.keys(tasksByPerson).length > 0 ? (
                        Object.entries(tasksByPerson).map(([person, tasks]) => (
                          <div key={person} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{person}</span>
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {tasks.length}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500">Ei tehtäviä tänään</div>
                      )}
                    </div>
                  ) : (
                    <div className={`${stat.isText ? 'text-lg' : 'text-2xl'} font-bold ${stat.color} ${stat.isText ? 'leading-tight' : ''}`}>
                      {stat.value}
                    </div>
                  )}
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
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span>Tärkeät tehtävät tänään</span>
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
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
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
    </div>
  );
};

export default Dashboard;