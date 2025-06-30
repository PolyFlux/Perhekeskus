import React, { useState } from 'react';
import { Calendar, CheckSquare, UtensilsCrossed, List, PiggyBank, Home } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import TodoLists from './components/TodoLists';
import MealPlanner from './components/MealPlanner';
import ListManager from './components/ListManager';
import BudgetTracker from './components/BudgetTracker';

type ViewType = 'dashboard' | 'calendar' | 'todos' | 'meals' | 'lists' | 'budget';

interface ListItem {
  id: number;
  text: string;
  completed: boolean;
  quantity?: string;
}

interface CustomList {
  id: number;
  name: string;
  type: 'shopping' | 'packing' | 'custom';
  icon: string;
  color: string;
  bgColor: string;
  items: ListItem[];
  createdAt: Date;
}

interface Meal {
  id: number;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: string[];
  prepTime: number;
}

interface DayMeals {
  date: string;
  meals: { [key: string]: Meal | null };
}

interface ExtraItem {
  id: number;
  text: string;
  quantity?: string;
}

interface PlanningSettings {
  startDay: number; // 0 = sunnuntai, 1 = maanantai, jne.
  periodLength: number; // päivien määrä
}

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

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  // Jaettu tila ostoslistalle
  const [sharedShoppingList, setSharedShoppingList] = useState<ListItem[]>([
    { id: 1, text: 'Maito', completed: false, quantity: '2L' },
    { id: 2, text: 'Leipä', completed: true, quantity: '1 leipä' },
    { id: 3, text: 'Omenat', completed: false, quantity: '6 kpl' },
    { id: 4, text: 'Kananrinta', completed: false, quantity: '1kg' },
  ]);

  // Ruokasuunnittelun asetukset
  const [planningSettings, setPlanningSettings] = useState<PlanningSettings>({
    startDay: 1, // Maanantai
    periodLength: 7 // Viikko
  });

  // Ruokasuunnittelun tila - säilyttää kaikki jaksot
  const [allPeriodMeals, setAllPeriodMeals] = useState<{ [periodKey: string]: DayMeals[] }>({});
  const [allPeriodExtras, setAllPeriodExtras] = useState<{ [periodKey: string]: ExtraItem[] }>({});

  const [periodStart, setPeriodStart] = useState(() => {
    const today = new Date();
    const startOfPeriod = new Date(today);
    
    // Laske jakson alkupäivä
    const dayOfWeek = today.getDay();
    const daysToSubtract = (dayOfWeek - planningSettings.startDay + 7) % 7;
    startOfPeriod.setDate(today.getDate() - daysToSubtract);
    
    return startOfPeriod;
  });

  // Tehtävien tila (lisätään tämä)
  const [allTasks, setAllTasks] = useState<Task[]>([
    {
      id: 1,
      name: 'Ruokaostokset',
      completed: false,
      priority: 'high',
      category: 'kotitalous',
      type: 'specific',
      assignedTo: ['Äiti'],
      dueDate: new Date().toISOString().split('T')[0],
      description: 'Viikon ruokaostokset kaupasta',
      createdAt: new Date()
    },
    {
      id: 2,
      name: 'Siivoa keittiö',
      completed: false,
      priority: 'medium',
      category: 'kotitalous',
      type: 'daily',
      assignedTo: ['Kuka tahansa'],
      createdAt: new Date()
    },
    {
      id: 3,
      name: 'Jalkapalloharjoitukset',
      completed: false,
      priority: 'high',
      category: 'urheilu',
      type: 'specific',
      assignedTo: ['Perhe'],
      dueDate: new Date().toISOString().split('T')[0],
      description: 'Viikkoharjoitukset kentällä',
      createdAt: new Date()
    }
  ]);

  // Budjettitiedot (lisätään tämä)
  const [budgetData, setBudgetData] = useState({
    totalBudget: 3000,
    spent: 1760,
    remaining: 1240
  });

  const navigationItems = [
    { id: 'dashboard', label: 'Etusivu', icon: Home },
    { id: 'calendar', label: 'Kalenteri', icon: Calendar },
    { id: 'todos', label: 'Tehtävälistat', icon: CheckSquare },
    { id: 'meals', label: 'Ruokasuunnittelu', icon: UtensilsCrossed },
    { id: 'lists', label: 'Listat', icon: List },
    { id: 'budget', label: 'Budjetti', icon: PiggyBank },
  ];

  // Hae tämän päivän ateriat dashboardia varten
  const getTodayMeals = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentPeriodKey = `${periodStart.getFullYear()}-${periodStart.getMonth()}-${periodStart.getDate()}-${planningSettings.periodLength}`;
    const periodMeals = allPeriodMeals[currentPeriodKey] || [];
    
    const todayMealsData = periodMeals.find(day => day.date === today);
    if (!todayMealsData) return [];
    
    return Object.values(todayMealsData.meals).filter(meal => meal !== null) as Meal[];
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={setCurrentView}
            todayTasks={allTasks}
            budgetRemaining={budgetData.remaining}
            todayMeals={getTodayMeals()}
          />
        );
      case 'calendar':
        return <CalendarView />;
      case 'todos':
        return (
          <TodoLists 
            allTasks={allTasks}
            setAllTasks={setAllTasks}
          />
        );
      case 'meals':
        return (
          <MealPlanner 
            sharedShoppingList={sharedShoppingList}
            setSharedShoppingList={setSharedShoppingList}
            periodStart={periodStart}
            setPeriodStart={setPeriodStart}
            allPeriodMeals={allPeriodMeals}
            setAllPeriodMeals={setAllPeriodMeals}
            allPeriodExtras={allPeriodExtras}
            setAllPeriodExtras={setAllPeriodExtras}
            planningSettings={planningSettings}
            setPlanningSettings={setPlanningSettings}
          />
        );
      case 'lists':
        return (
          <ListManager 
            sharedShoppingList={sharedShoppingList}
            setSharedShoppingList={setSharedShoppingList}
          />
        );
      case 'budget':
        return <BudgetTracker />;
      default:
        return (
          <Dashboard 
            onNavigate={setCurrentView}
            todayTasks={allTasks}
            budgetRemaining={budgetData.remaining}
            todayMeals={getTodayMeals()}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigointi */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-800">Perhekeskus</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as ViewType)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentView === item.id
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobiilivalikko */}
            <div className="md:hidden">
              <select
                value={currentView}
                onChange={(e) => setCurrentView(e.target.value as ViewType)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {navigationItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Pääsisältö */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;