import React, { useState, useEffect } from 'react';
import { Plus, UtensilsCrossed, ShoppingCart, Clock, Settings, ChefHat, Trash2, X, Calendar } from 'lucide-react';

interface Meal {
  id: number;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'evening_snack';
  ingredients: string[];
  prepTime: number;
}

interface DayMeals {
  date: string;
  meals: { [key: string]: Meal | null };
  extras: ExtraItem[];
}

interface ExtraItem {
  id: number;
  text: string;
  quantity?: string;
}

interface ListItem {
  id: number;
  text: string;
  completed: boolean;
  quantity?: string;
}

interface PlanningSettings {
  startDay: number; // 0 = sunnuntai, 1 = maanantai, jne.
  periodLength: number; // päivien määrä
}

interface NewMeal {
  name: string;
  ingredients: string[];
  prepTime: number;
  types: string[];
}

interface MealPlannerProps {
  sharedShoppingList: ListItem[];
  setSharedShoppingList: (items: ListItem[]) => void;
  periodStart: Date;
  setPeriodStart: (date: Date) => void;
  allPeriodMeals: { [periodKey: string]: DayMeals[] };
  setAllPeriodMeals: (meals: { [periodKey: string]: DayMeals[] }) => void;
  allPeriodExtras: { [periodKey: string]: ExtraItem[] };
  setAllPeriodExtras: (extras: { [periodKey: string]: ExtraItem[] }) => void;
  planningSettings: PlanningSettings;
  setPlanningSettings: (settings: PlanningSettings) => void;
}

const MealPlanner: React.FC<MealPlannerProps> = ({ 
  sharedShoppingList, 
  setSharedShoppingList,
  periodStart,
  setPeriodStart,
  allPeriodMeals,
  setAllPeriodMeals,
  allPeriodExtras,
  setAllPeriodExtras,
  planningSettings,
  setPlanningSettings
}) => {
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showCreateMealModal, setShowCreateMealModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [newExtraItem, setNewExtraItem] = useState('');
  const [newExtraQuantity, setNewExtraQuantity] = useState('');
  const [newDayExtra, setNewDayExtra] = useState<{ [key: string]: string }>({});
  const [newDayExtraQuantity, setNewDayExtraQuantity] = useState<{ [key: string]: string }>({});

  // Mukautetut ateriat
  const [customMeals, setCustomMeals] = useState<Meal[]>([]);

  // Uuden aterian luomislomake
  const [newMeal, setNewMeal] = useState<NewMeal>({
    name: '',
    ingredients: [''],
    prepTime: 30,
    types: []
  });

  const sampleMeals: Meal[] = [
    {
      id: 1,
      name: 'Munakokkeli ja paahtoleipä',
      type: 'breakfast',
      ingredients: ['Munat', 'Leipä', 'Voi', 'Suola', 'Pippuri'],
      prepTime: 15
    },
    {
      id: 2,
      name: 'Grillattu kanasalaatti',
      type: 'lunch',
      ingredients: ['Kananrinta', 'Salaattisekoitus', 'Tomaatit', 'Kurkku', 'Oliiviöljy'],
      prepTime: 25
    },
    {
      id: 3,
      name: 'Spagetti Bolognese',
      type: 'dinner',
      ingredients: ['Spagetti', 'Jauheliha', 'Tomaattikastike', 'Sipuli', 'Valkosipuli', 'Parmesan'],
      prepTime: 45
    },
    {
      id: 4,
      name: 'Kreikkalainen jogurtti ja marjat',
      type: 'snack',
      ingredients: ['Kreikkalainen jogurtti', 'Marjasekoitus', 'Hunaja', 'Granola'],
      prepTime: 5
    },
    {
      id: 5,
      name: 'Pähkinäsekoitus ja tee',
      type: 'evening_snack',
      ingredients: ['Pähkinäsekoitus', 'Tee', 'Hunaja'],
      prepTime: 5
    }
  ];

  const dayNames = ['Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai', 'Sunnuntai'];
  const mealTypes = [
    { key: 'breakfast', label: 'Aamiainen', shortLabel: 'AA', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'lunch', label: 'Lounas', shortLabel: 'LO', color: 'bg-green-100 text-green-800' },
    { key: 'dinner', label: 'Päivällinen', shortLabel: 'PÄ', color: 'bg-blue-100 text-blue-800' },
    { key: 'snack', label: 'Välipala', shortLabel: 'VP', color: 'bg-purple-100 text-purple-800' },
    { key: 'evening_snack', label: 'Iltapala', shortLabel: 'IP', color: 'bg-orange-100 text-orange-800' }
  ];

  // Jakson avain
  const getPeriodKey = (startDate: Date) => {
    return `${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDate()}-${planningSettings.periodLength}`;
  };

  // Nykyisen jakson ateriat
  const currentPeriodKey = getPeriodKey(periodStart);
  const periodMeals = allPeriodMeals[currentPeriodKey] || [];
  const periodExtras = allPeriodExtras[currentPeriodKey] || [];

  // Alusta jakso jos ei ole olemassa
  useEffect(() => {
    const periodKey = getPeriodKey(periodStart);
    if (!allPeriodMeals[periodKey]) {
      const days = [];
      for (let i = 0; i < planningSettings.periodLength; i++) {
        const date = new Date(periodStart);
        date.setDate(periodStart.getDate() + i);
        days.push({
          date: date.toISOString().split('T')[0],
          meals: {
            breakfast: null,
            lunch: null,
            dinner: null,
            snack: null,
            evening_snack: null
          },
          extras: []
        });
      }
      setAllPeriodMeals({ ...allPeriodMeals, [periodKey]: days });
    }
    if (!allPeriodExtras[periodKey]) {
      setAllPeriodExtras({ ...allPeriodExtras, [periodKey]: [] });
    }
  }, [periodStart, planningSettings.periodLength, allPeriodMeals, allPeriodExtras, setAllPeriodMeals, setAllPeriodExtras]);

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newPeriodStart = new Date(periodStart);
    newPeriodStart.setDate(periodStart.getDate() + (direction === 'next' ? planningSettings.periodLength : -planningSettings.periodLength));
    setPeriodStart(newPeriodStart);
  };

  const addMealToDay = (meal: Meal) => {
    const updatedMeals = periodMeals.map(day => 
      day.date === selectedDay 
        ? { ...day, meals: { ...day.meals, [selectedMealType]: meal } }
        : day
    );
    setAllPeriodMeals({ ...allPeriodMeals, [currentPeriodKey]: updatedMeals });
    setShowAddMealModal(false);
    setSelectedDay('');
    setSelectedMealType('');
  };

  const removeMealFromDay = (dayDate: string, mealType: string) => {
    const updatedMeals = periodMeals.map(day => 
      day.date === dayDate 
        ? { ...day, meals: { ...day.meals, [mealType]: null } }
        : day
    );
    setAllPeriodMeals({ ...allPeriodMeals, [currentPeriodKey]: updatedMeals });
  };

  const addExtraToDay = (dayDate: string) => {
    const itemText = newDayExtra[dayDate]?.trim();
    if (!itemText) return;

    const extraItem: ExtraItem = {
      id: Date.now(),
      text: itemText,
      quantity: newDayExtraQuantity[dayDate]?.trim() || undefined
    };

    const updatedMeals = periodMeals.map(day => 
      day.date === dayDate 
        ? { ...day, extras: [...(day.extras || []), extraItem] }
        : day
    );
    
    setAllPeriodMeals({ ...allPeriodMeals, [currentPeriodKey]: updatedMeals });
    setNewDayExtra({ ...newDayExtra, [dayDate]: '' });
    setNewDayExtraQuantity({ ...newDayExtraQuantity, [dayDate]: '' });
  };

  const removeExtraFromDay = (dayDate: string, extraId: number) => {
    const updatedMeals = periodMeals.map(day => 
      day.date === dayDate 
        ? { ...day, extras: (day.extras || []).filter(extra => extra.id !== extraId) }
        : day
    );
    setAllPeriodMeals({ ...allPeriodMeals, [currentPeriodKey]: updatedMeals });
  };

  const addExtraItem = () => {
    if (!newExtraItem.trim()) return;

    const extraItem: ExtraItem = {
      id: Date.now(),
      text: newExtraItem.trim(),
      quantity: newExtraQuantity.trim() || undefined
    };

    const updatedExtras = [...periodExtras, extraItem];
    setAllPeriodExtras({ ...allPeriodExtras, [currentPeriodKey]: updatedExtras });
    setNewExtraItem('');
    setNewExtraQuantity('');
  };

  const removeExtraItem = (itemId: number) => {
    const updatedExtras = periodExtras.filter(item => item.id !== itemId);
    setAllPeriodExtras({ ...allPeriodExtras, [currentPeriodKey]: updatedExtras });
  };

  const generateShoppingList = () => {
    const allIngredients: string[] = [];
    
    // Lisää aterioiden ainesosat
    periodMeals.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal) {
          allIngredients.push(...meal.ingredients);
        }
      });
    });
    
    // Laske jokaisen ainesosan esiintymiskerrat
    const ingredientCounts = allIngredients.reduce((acc, ingredient) => {
      acc[ingredient] = (acc[ingredient] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return Object.entries(ingredientCounts);
  };

  const updateShoppingList = () => {
    const mealIngredients = generateShoppingList();
    
    // Poista vanhat ruokasuunnittelusta tulleet tuotteet
    const nonMealItems = sharedShoppingList.filter(item => 
      !item.text.startsWith('[Ruokasuunnittelu]')
    );
    
    // Lisää uudet ruokasuunnittelun tuotteet
    const newMealItems: ListItem[] = mealIngredients.map(([ingredient, count], index) => ({
      id: Date.now() + index,
      text: `[Ruokasuunnittelu] ${ingredient}`,
      completed: false,
      quantity: count > 1 ? `${count}x` : undefined
    }));

    // Lisää ylimääräiset tuotteet (jakson yleiset)
    const extraItems: ListItem[] = periodExtras.map((extra, index) => ({
      id: Date.now() + 1000 + index,
      text: `[Ruokasuunnittelu] ${extra.text}`,
      completed: false,
      quantity: extra.quantity
    }));

    // Lisää päiväkohtaiset lisäksi-tuotteet
    const dayExtraItems: ListItem[] = [];
    periodMeals.forEach((day, dayIndex) => {
      if (day.extras && day.extras.length > 0) {
        day.extras.forEach((extra, extraIndex) => {
          dayExtraItems.push({
            id: Date.now() + 2000 + dayIndex * 100 + extraIndex,
            text: `[Ruokasuunnittelu] ${extra.text}`,
            completed: false,
            quantity: extra.quantity
          });
        });
      }
    });
    
    setSharedShoppingList([...nonMealItems, ...newMealItems, ...extraItems, ...dayExtraItems]);
  };

  const clearMealItemsFromShoppingList = () => {
    // Poista kaikki ruokasuunnittelusta tulleet tuotteet jaksosta riippumatta
    const nonMealItems = sharedShoppingList.filter(item => 
      !item.text.startsWith('[Ruokasuunnittelu]')
    );
    setSharedShoppingList(nonMealItems);
  };

  const formatPeriodRange = () => {
    const endDate = new Date(periodStart);
    endDate.setDate(periodStart.getDate() + planningSettings.periodLength - 1);
    
    if (planningSettings.periodLength === 1) {
      return periodStart.toLocaleDateString('fi-FI', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
    
    return `${periodStart.toLocaleDateString('fi-FI', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('fi-FI', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const getPeriodName = () => {
    switch (planningSettings.periodLength) {
      case 1: return 'Päivä';
      case 3: return '3 päivää';
      case 5: return 'Arkiviikko';
      case 7: return 'Viikko';
      default: return `${planningSettings.periodLength} päivää`;
    }
  };

  const getDayName = (date: Date, index: number) => {
    if (planningSettings.periodLength === 1) {
      return date.toLocaleDateString('fi-FI', { weekday: 'long' });
    }
    
    const dayOfWeek = date.getDay();
    const dayName = dayOfWeek === 0 ? 'Su' : dayNames[dayOfWeek - 1];
    return `${dayName} ${date.getDate()}.${date.getMonth() + 1}`;
  };

  // Uuden aterian luominen
  const addIngredientField = () => {
    setNewMeal(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index: number) => {
    if (newMeal.ingredients.length > 1) {
      setNewMeal(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    setNewMeal(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }));
  };

  const toggleMealType = (type: string) => {
    setNewMeal(prev => ({
      ...prev,
      types: prev.types.includes(type) 
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const createNewMeal = () => {
    if (!newMeal.name.trim() || newMeal.types.length === 0 || newMeal.ingredients.filter(ing => ing.trim()).length === 0) {
      return;
    }

    // Luo ateria jokaiselle valitulle tyypille
    const newMeals: Meal[] = newMeal.types.map(type => ({
      id: Date.now() + Math.random(),
      name: newMeal.name.trim(),
      type: type as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'evening_snack',
      ingredients: newMeal.ingredients.filter(ing => ing.trim()),
      prepTime: newMeal.prepTime
    }));

    setCustomMeals(prev => [...prev, ...newMeals]);
    
    // Tyhjennä lomake
    setNewMeal({
      name: '',
      ingredients: [''],
      prepTime: 30,
      types: []
    });
    
    setShowCreateMealModal(false);
  };

  const isCreateMealFormValid = () => {
    return newMeal.name.trim() && 
           newMeal.types.length > 0 && 
           newMeal.ingredients.filter(ing => ing.trim()).length > 0;
  };

  // Yhdistä oletusateriat ja mukautetut ateriat
  const allMeals = [...sampleMeals, ...customMeals];

  return (
    <div className="space-y-6">
      {/* Otsikko */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ruokasuunnittelu</h2>
          <p className="text-slate-600">Suunnittele perheen ateriat</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => navigatePeriod('prev')}
              className="px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200"
            >
              ← Edellinen
            </button>
            <span className="px-4 py-1 text-sm font-medium text-slate-800">
              {formatPeriodRange()}
            </span>
            <button
              onClick={() => navigatePeriod('next')}
              className="px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200"
            >
              Seuraava →
            </button>
          </div>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center space-x-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors duration-200"
          >
            <Settings className="h-4 w-4" />
            <span>Asetukset</span>
          </button>
          <button
            onClick={() => setShowCreateMealModal(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <ChefHat className="h-4 w-4" />
            <span>Luo uusi ateria</span>
          </button>
        </div>
      </div>

      {/* Ateriaruudukko - Vain ateriat */}
      <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden">
        {/* Otsikkorivi */}
        <div className="grid bg-slate-50 border-b border-slate-200" style={{ gridTemplateColumns: `80px repeat(${Math.min(planningSettings.periodLength, 7)}, 1fr)` }}>
          <div className="p-2 text-xs font-medium text-slate-700 text-center">Tyyppi</div>
          {periodMeals.slice(0, Math.min(planningSettings.periodLength, 7)).map((day, index) => {
            const date = new Date(day.date);
            return (
              <div key={index} className="p-2 text-xs font-medium text-slate-700 text-center border-l border-slate-200">
                {getDayName(date, index)}
              </div>
            );
          })}
        </div>
        
        {/* Ateriarivit */}
        {mealTypes.map(mealType => (
          <div key={mealType.key} className="grid border-b border-slate-200" style={{ gridTemplateColumns: `80px repeat(${Math.min(planningSettings.periodLength, 7)}, 1fr)` }}>
            <div className={`p-2 flex items-center justify-center ${mealType.color} border-r border-slate-200`}>
              <span className="text-xs font-medium">{mealType.shortLabel}</span>
            </div>
            {periodMeals.slice(0, Math.min(planningSettings.periodLength, 7)).map((day, dayIndex) => {
              const meal = day.meals[mealType.key];
              return (
                <div 
                  key={dayIndex} 
                  className="p-1 border-l border-slate-200 min-h-16 hover:bg-slate-50 transition-colors duration-200"
                >
                  {meal ? (
                    <div className="bg-white rounded-md p-2 border border-slate-200 group relative h-full">
                      <div className="font-medium text-slate-800 text-xs mb-1 leading-tight line-clamp-2">{meal.name}</div>
                      <div className="flex items-center text-xs text-slate-600">
                        <Clock className="h-2 w-2 mr-1" />
                        <span className="text-xs">{meal.prepTime}min</span>
                      </div>
                      <button
                        onClick={() => removeMealFromDay(day.date, mealType.key)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedDay(day.date);
                        setSelectedMealType(mealType.key);
                        setShowAddMealModal(true);
                      }}
                      className="w-full h-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all duration-200 border-2 border-dashed border-slate-200 hover:border-slate-300 min-h-14"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Lisäksi-osio - Erillinen taulukko */}
      <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-800">Lisäksi-tuotteet</h3>
          <p className="text-sm text-slate-600">Päiväkohtaiset ja jakson yleiset lisäostokset</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Päiväkohtaiset lisäksi */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-slate-800 flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Päiväkohtaiset lisäksi</span>
            </h4>
            
            <div className="space-y-3">
              {periodMeals.slice(0, Math.min(planningSettings.periodLength, 7)).map((day, dayIndex) => {
                const date = new Date(day.date);
                return (
                  <div key={dayIndex} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-2">
                      {getDayName(date, dayIndex)}
                    </div>
                    
                    {/* Lisäyslomake */}
                    <div className="space-y-2 mb-3">
                      <input
                        type="text"
                        placeholder="Tuote..."
                        value={newDayExtra[day.date] || ''}
                        onChange={(e) => setNewDayExtra({ ...newDayExtra, [day.date]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && addExtraToDay(day.date)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Määrä..."
                          value={newDayExtraQuantity[day.date] || ''}
                          onChange={(e) => setNewDayExtraQuantity({ ...newDayExtraQuantity, [day.date]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && addExtraToDay(day.date)}
                          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => addExtraToDay(day.date)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Näytä lisäksi-tuotteet */}
                    <div className="space-y-2">
                      {(day.extras || []).map((extra) => (
                        <div key={extra.id} className="flex items-center justify-between bg-white rounded-lg p-2 border border-blue-200 group">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-slate-800">{extra.text}</div>
                            {extra.quantity && (
                              <div className="text-xs text-slate-600">({extra.quantity})</div>
                            )}
                          </div>
                          <button
                            onClick={() => removeExtraFromDay(day.date, extra.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      {(!day.extras || day.extras.length === 0) && (
                        <div className="text-center py-4 text-slate-500 text-sm">
                          Ei lisäksi-tuotteita tälle päivälle
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jakson yleiset lisäksi */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-slate-800 flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4 text-green-600" />
              <span>Jakson yleiset lisäksi ({getPeriodName()})</span>
            </h4>
            
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              {/* Lisäyslomake */}
              <div className="space-y-2 mb-4">
                <input
                  type="text"
                  placeholder="Lisää tuote..."
                  value={newExtraItem}
                  onChange={(e) => setNewExtraItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addExtraItem()}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Määrä..."
                    value={newExtraQuantity}
                    onChange={(e) => setNewExtraQuantity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addExtraItem()}
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    onClick={addExtraItem}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Näytä yleiset lisäksi-tuotteet */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {periodExtras.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-2 border border-green-200 group">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-800">{item.text}</div>
                      {item.quantity && (
                        <div className="text-xs text-slate-600">({item.quantity})</div>
                      )}
                    </div>
                    <button
                      onClick={() => removeExtraItem(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {periodExtras.length === 0 && (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    Ei yleisiä lisäksi-tuotteita
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ostoslista */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Ostoslista ({getPeriodName()})</span>
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={clearMealItemsFromShoppingList}
              className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4" />
              <span>Poista ostoslistasta</span>
            </button>
            <button
              onClick={updateShoppingList}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Päivitä ostoslista</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {generateShoppingList().map(([ingredient, count]) => (
            <div key={ingredient} className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
              <span className="text-sm text-slate-800">{ingredient}</span>
              {count > 1 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {count}x
                </span>
              )}
            </div>
          ))}
          {periodExtras.map((extra) => (
            <div key={extra.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
              <span className="text-sm text-slate-800">{extra.text}</span>
              {extra.quantity && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {extra.quantity}
                </span>
              )}
            </div>
          ))}
          {/* Näytä päiväkohtaiset lisäksi-tuotteet */}
          {periodMeals.flatMap(day => day.extras || []).map((extra) => (
            <div key={`day-${extra.id}`} className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
              <span className="text-sm text-slate-800">{extra.text}</span>
              {extra.quantity && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  {extra.quantity}
                </span>
              )}
            </div>
          ))}
          {generateShoppingList().length === 0 && periodExtras.length === 0 && periodMeals.every(day => !day.extras || day.extras.length === 0) && (
            <div className="col-span-full text-center py-8 text-slate-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Lisää aterioita luodaksesi ostoslistan</p>
            </div>
          )}
        </div>
      </div>

      {/* Asetukset-modaali */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Suunnitteluasetukset</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Jakson pituus</label>
                <div className="space-y-2">
                  {[
                    { value: 1, label: 'Päivä' },
                    { value: 3, label: '3 päivää' },
                    { value: 5, label: 'Arkiviikko (5 päivää)' },
                    { value: 7, label: 'Viikko (7 päivää)' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="periodLength"
                        value={option.value}
                        checked={planningSettings.periodLength === option.value}
                        onChange={(e) => setPlanningSettings({ 
                          ...planningSettings, 
                          periodLength: parseInt(e.target.value) 
                        })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-800">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Viikon alkupäivä</label>
                <div className="space-y-2">
                  {[
                    { value: 0, label: 'Sunnuntai' },
                    { value: 1, label: 'Maanantai' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="startDay"
                        value={option.value}
                        checked={planningSettings.startDay === option.value}
                        onChange={(e) => setPlanningSettings({ 
                          ...planningSettings, 
                          startDay: parseInt(e.target.value) 
                        })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-800">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
              >
                Peruuta
              </button>
              <button
                onClick={() => {
                  // Päivitä jakson alku uusien asetusten mukaan
                  const today = new Date();
                  const newPeriodStart = new Date(today);
                  const dayOfWeek = today.getDay();
                  const daysToSubtract = (dayOfWeek - planningSettings.startDay + 7) % 7;
                  newPeriodStart.setDate(today.getDate() - daysToSubtract);
                  setPeriodStart(newPeriodStart);
                  setShowSettingsModal(false);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Tallenna
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Luo uusi ateria -modaali */}
      {showCreateMealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Kiinteä otsikko */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Luo uusi ateria</h3>
                <button
                  onClick={() => setShowCreateMealModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Vieritettävä sisältö */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Aterian nimi */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Aterian nimi *
                  </label>
                  <input
                    type="text"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Esim. Pasta Carbonara"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Ateriatyypit */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Ateriatyypit * (valitse vähintään yksi)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {mealTypes.map(mealType => (
                      <label key={mealType.key} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newMeal.types.includes(mealType.key)}
                          onChange={() => toggleMealType(mealType.key)}
                          className="text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className={`px-3 py-1 rounded-full text-sm ${mealType.color}`}>
                          {mealType.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ainesosat */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Ainesosat * (vähintään yksi)
                  </label>
                  <div className="space-y-2">
                    {newMeal.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                          placeholder={`Ainesosa ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {newMeal.ingredients.length > 1 && (
                          <button
                            onClick={() => removeIngredient(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addIngredientField}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                    >
                      + Lisää ainesosa
                    </button>
                  </div>
                </div>

                {/* Valmistusaika */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Valmistusaika (minuuttia)
                  </label>
                  <input
                    type="number"
                    value={newMeal.prepTime}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 30 }))}
                    min="1"
                    max="300"
                    className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Esikatselu */}
                {newMeal.name && newMeal.types.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-800 mb-2">Esikatselu:</h4>
                    <div className="text-sm text-slate-600">
                      <p><strong>Nimi:</strong> {newMeal.name}</p>
                      <p><strong>Tyypit:</strong> {newMeal.types.map(type => 
                        mealTypes.find(mt => mt.key === type)?.label
                      ).join(', ')}</p>
                      <p><strong>Ainesosat:</strong> {newMeal.ingredients.filter(ing => ing.trim()).join(', ')}</p>
                      <p><strong>Valmistusaika:</strong> {newMeal.prepTime} min</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Kiinteät painikkeet */}
            <div className="p-6 border-t border-slate-200">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowCreateMealModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                >
                  Peruuta
                </button>
                <button
                  onClick={createNewMeal}
                  disabled={!isCreateMealFormValid()}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isCreateMealFormValid()
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Luo ateria
                </button>
              </div>
              {!isCreateMealFormValid() && (
                <div className="mt-2 text-sm text-red-600">
                  {!newMeal.name.trim() && 'Aterian nimi puuttuu. '}
                  {newMeal.types.length === 0 && 'Valitse vähintään yksi ateriatyyppi. '}
                  {newMeal.ingredients.filter(ing => ing.trim()).length === 0 && 'Lisää vähintään yksi ainesosa.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lisää ateria -modaali */}
      {showAddMealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Valitse ateria</h3>
                <button
                  onClick={() => setShowAddMealModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              {/* Omat ateriat */}
              {customMeals.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-slate-800 mb-3 flex items-center space-x-2">
                    <ChefHat className="h-4 w-4 text-blue-600" />
                    <span>Omat ateriat</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {customMeals
                      .filter(meal => !selectedMealType || meal.type === selectedMealType)
                      .map(meal => (
                        <button
                          key={meal.id}
                          onClick={() => addMealToDay(meal)}
                          className="text-left p-4 border-2 border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-800">{meal.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              mealTypes.find(t => t.key === meal.type)?.color
                            }`}>
                              {mealTypes.find(t => t.key === meal.type)?.label}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600 mb-2">
                            <Clock className="h-3 w-3 mr-1" />
                            {meal.prepTime} minuuttia
                          </div>
                          <div className="text-xs text-slate-600">
                            {meal.ingredients.join(', ')}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Oletusateriat */}
              <div>
                <h4 className="text-md font-medium text-slate-800 mb-3">Oletusateriat</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sampleMeals
                    .filter(meal => !selectedMealType || meal.type === selectedMealType)
                    .map(meal => (
                      <button
                        key={meal.id}
                        onClick={() => addMealToDay(meal)}
                        className="text-left p-4 border border-slate-200 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-800">{meal.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            mealTypes.find(t => t.key === meal.type)?.color
                          }`}>
                            {mealTypes.find(t => t.key === meal.type)?.label}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 mb-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {meal.prepTime} minuuttia
                        </div>
                        <div className="text-xs text-slate-600">
                          {meal.ingredients.join(', ')}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;