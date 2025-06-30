import React, { useState } from 'react';
import { Plus, Check, X, User, Users, Clock, Calendar } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  isShared?: boolean;
  completedBy?: string;
  dueDate?: Date;
  dueDateType?: 'specific' | 'within_week' | 'flexible';
  category?: 'today' | 'scheduled' | 'weekly';
}

interface Person {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  tasks: Task[];
}

const TodoLists: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([
    {
      id: 'person1',
      name: 'Äiti',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      tasks: [
        { id: 1, text: 'Ruokaostokset', completed: false, priority: 'high', category: 'today' },
        { id: 2, text: 'Soita hammaslääkärille ajanvarausta varten', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 25), dueDateType: 'specific', category: 'scheduled' },
        { id: 3, text: 'Hae kuivapesu', completed: true, priority: 'low', category: 'today' },
        { id: 4, text: 'Valmista illallinen', completed: false, priority: 'high', category: 'today' },
        { id: 5, text: 'Vie roskat ulos', completed: false, priority: 'medium', isShared: true, category: 'today' },
        { id: 6, text: 'Käy apteekissa', completed: true, priority: 'medium', isShared: true, completedBy: 'Äiti', category: 'today' },
        { id: 7, text: 'Siivoa kylpyhuone', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly' },
        { id: 8, text: 'Varaa kesäloma', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 30), dueDateType: 'specific', category: 'scheduled' },
        { id: 14, text: 'Lääkäriaika', completed: false, priority: 'high', dueDate: new Date(2025, 0, 22), dueDateType: 'specific', category: 'scheduled' },
        { id: 15, text: 'Kaupassa käynti', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 23), dueDateType: 'specific', category: 'scheduled' },
      ]
    },
    {
      id: 'person2',
      name: 'Isi',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      tasks: [
        { id: 9, text: 'Korjaa keittiön hana', completed: false, priority: 'high', category: 'today' },
        { id: 10, text: 'Varaa auton huolto', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 28), dueDateType: 'specific', category: 'scheduled' },
        { id: 11, text: 'Maksa sähkölasku', completed: true, priority: 'high', category: 'today' },
        { id: 12, text: 'Siivoa autotalli', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly' },
        { id: 5, text: 'Vie roskat ulos', completed: false, priority: 'medium', isShared: true, category: 'today' },
        { id: 6, text: 'Käy apteekissa', completed: true, priority: 'medium', isShared: true, completedBy: 'Äiti', category: 'today' },
        { id: 13, text: 'Osta uusi työkalupakki', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly' },
        { id: 16, text: 'Kokous töissä', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 24), dueDateType: 'specific', category: 'scheduled' },
      ]
    }
  ]);

  const [newTask, setNewTask] = useState<{ [key: string]: string }>({});
  const [selectedPriority, setSelectedPriority] = useState<{ [key: string]: 'low' | 'medium' | 'high' }>({});
  const [isSharedTask, setIsSharedTask] = useState<{ [key: string]: boolean }>({});
  const [taskDueDate, setTaskDueDate] = useState<{ [key: string]: string }>({});
  const [taskDueDateType, setTaskDueDateType] = useState<{ [key: string]: 'none' | 'specific' | 'within_week' }>({});
  
  // Henkilökohtaiset näkymävalinnat
  const [personViews, setPersonViews] = useState<{ [key: string]: 'today' | 'week' }>({
    person1: 'today',
    person2: 'today'
  });

  const dayNames = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

  const addTask = (personId: string) => {
    const taskText = newTask[personId]?.trim();
    if (!taskText) return;

    const dueDateType = taskDueDateType[personId] || 'none';
    let category: 'today' | 'scheduled' | 'weekly' = 'today';
    let dueDate: Date | undefined;

    if (dueDateType === 'specific' && taskDueDate[personId]) {
      dueDate = new Date(taskDueDate[personId]);
      category = 'scheduled';
    } else if (dueDateType === 'within_week') {
      category = 'weekly';
    }

    const newTaskObj: Task = {
      id: Date.now(),
      text: taskText,
      completed: false,
      priority: selectedPriority[personId] || 'medium',
      isShared: isSharedTask[personId] || false,
      dueDate,
      dueDateType: dueDateType === 'none' ? undefined : dueDateType,
      category
    };

    if (isSharedTask[personId]) {
      // Lisää jaettu tehtävä molemmille
      setPeople(people.map(person => ({
        ...person,
        tasks: [...person.tasks, newTaskObj]
      })));
    } else {
      // Lisää henkilökohtainen tehtävä vain valitulle henkilölle
      setPeople(people.map(person => 
        person.id === personId 
          ? { ...person, tasks: [...person.tasks, newTaskObj] }
          : person
      ));
    }

    // Tyhjennä lomake
    setNewTask({ ...newTask, [personId]: '' });
    setSelectedPriority({ ...selectedPriority, [personId]: 'medium' });
    setIsSharedTask({ ...isSharedTask, [personId]: false });
    setTaskDueDate({ ...taskDueDate, [personId]: '' });
    setTaskDueDateType({ ...taskDueDateType, [personId]: 'none' });
  };

  const toggleTask = (personId: string, taskId: number) => {
    const person = people.find(p => p.id === personId);
    const task = person?.tasks.find(t => t.id === taskId);
    
    if (!task) return;

    if (task.isShared) {
      // Jaettu tehtävä - merkitse valmiiksi molemmille ja tallenna kuka teki
      setPeople(people.map(person => ({
        ...person,
        tasks: person.tasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                completed: !t.completed,
                completedBy: !t.completed ? person.name : undefined
              }
            : t
        )
      })));
    } else {
      // Henkilökohtainen tehtävä
      setPeople(people.map(person => 
        person.id === personId 
          ? { 
              ...person, 
              tasks: person.tasks.map(task => 
                task.id === taskId ? { ...task, completed: !task.completed } : task
              )
            }
          : person
      ));
    }
  };

  const deleteTask = (personId: string, taskId: number) => {
    const person = people.find(p => p.id === personId);
    const task = person?.tasks.find(t => t.id === taskId);
    
    if (task?.isShared) {
      // Poista jaettu tehtävä molemmilta
      setPeople(people.map(person => ({
        ...person,
        tasks: person.tasks.filter(task => task.id !== taskId)
      })));
    } else {
      // Poista henkilökohtainen tehtävä
      setPeople(people.map(person => 
        person.id === personId 
          ? { ...person, tasks: person.tasks.filter(task => task.id !== taskId) }
          : person
      ));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Korkea';
      case 'medium': return 'Keskitaso';
      case 'low': return 'Matala';
      default: return 'Keskitaso';
    }
  };

  const getTaskStats = (person: Person, view: 'today' | 'week') => {
    const filteredTasks = view === 'today' 
      ? person.tasks.filter(task => task.category === 'today')
      : person.tasks;
    const completed = filteredTasks.filter(task => task.completed).length;
    const total = filteredTasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  // Laske jaettujen tehtävien tilastot
  const getSharedTasksStats = () => {
    const allTasks = people[0]?.tasks || [];
    const sharedTasks = allTasks.filter(task => task.isShared);
    const completedShared = sharedTasks.filter(task => task.completed).length;
    return {
      total: sharedTasks.length,
      completed: completedShared,
      percentage: sharedTasks.length > 0 ? Math.round((completedShared / sharedTasks.length) * 100) : 0
    };
  };

  const sharedStats = getSharedTasksStats();

  // Hae henkilön viikkotehtävät
  const getPersonWeeklyTasks = (person: Person) => {
    return person.tasks.filter(task => task.category === 'weekly');
  };

  // Suodata tehtävät henkilön näkymän mukaan
  const getFilteredTasks = (person: Person) => {
    const view = personViews[person.id];
    if (view === 'today') {
      return person.tasks.filter(task => task.category === 'today');
    }
    return person.tasks;
  };

  // Tarkista onko tehtävä myöhässä
  const isTaskOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && !task.completed;
  };

  // Tarkista onko tehtävä tänään
  const isTaskDueToday = (task: Task) => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return today.toDateString() === dueDate.toDateString();
  };

  const formatDueDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Tänään';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Huomenna';
    } else {
      return date.toLocaleDateString('fi-FI', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  // Hae viikon päivät (maanantaista sunnuntaihin)
  const getWeekDays = () => {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Jos sunnuntai (0), vähennä 6, muuten vähennä (päivä - 1)
    monday.setDate(today.getDate() - daysToSubtract);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Hae tehtävät tietylle päivälle
  const getTasksForDay = (person: Person, date: Date) => {
    return person.tasks.filter(task => {
      if (task.category === 'today' && isTaskDueToday(task)) {
        return true;
      }
      if (task.category === 'scheduled' && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === date.toDateString();
      }
      if (task.category === 'weekly') {
        return true; // Viikkotehtävät näkyvät joka päivä
      }
      return false;
    });
  };

  // Tarkista onko päivä tänään
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Renderöi viikkonäkymä
  const renderWeekView = (person: Person) => {
    const weekDays = getWeekDays();
    
    return (
      <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden">
        {/* Viikon otsikko */}
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <h4 className="font-semibold text-slate-800 text-center">
            Viikko {weekDays[0].getDate()}.{weekDays[0].getMonth() + 1} - {weekDays[6].getDate()}.{weekDays[6].getMonth() + 1}.{weekDays[6].getFullYear()}
          </h4>
        </div>
        
        {/* Päivien otsikot */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {weekDays.map((day, index) => (
            <div key={index} className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${
              isToday(day) ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-slate-700'
            }`}>
              <div className="text-sm font-medium">{dayNames[index]}</div>
              <div className="text-lg font-bold">{day.getDate()}</div>
            </div>
          ))}
        </div>
        
        {/* Tehtävät päivittäin */}
        <div className="grid grid-cols-7 min-h-48">
          {weekDays.map((day, dayIndex) => {
            const dayTasks = getTasksForDay(person, day);
            return (
              <div key={dayIndex} className="p-2 border-r border-slate-200 last:border-r-0 min-h-48">
                <div className="space-y-2">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`p-2 rounded-lg border text-xs transition-all duration-200 ${
                        task.completed 
                          ? 'bg-slate-50 border-slate-200 opacity-60' 
                          : isTaskOverdue(task)
                          ? 'bg-red-50 border-red-200'
                          : task.category === 'weekly'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                      } ${task.isShared ? 'border-l-2 border-l-orange-400' : ''}`}
                    >
                      <div className="flex items-start space-x-2">
                        <button
                          onClick={() => toggleTask(person.id, task.id)}
                          className={`flex-shrink-0 w-3 h-3 rounded border flex items-center justify-center transition-colors duration-200 mt-0.5 ${
                            task.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-slate-300 hover:border-green-500'
                          }`}
                        >
                          {task.completed && <Check className="h-2 w-2" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium leading-tight ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-800'
                          }`}>
                            {task.text}
                          </div>
                          
                          <div className="flex items-center space-x-1 mt-1">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                            {task.category === 'weekly' && (
                              <span className="text-xs text-green-600 bg-green-100 px-1 rounded">Viikko</span>
                            )}
                            {task.isShared && (
                              <Users className="h-2 w-2 text-orange-600" />
                            )}
                          </div>
                          
                          {task.isShared && task.completed && task.completedBy && (
                            <div className="text-xs text-green-600 mt-1">
                              ✓ {task.completedBy}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => deleteTask(person.id, task.id)}
                          className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-200 opacity-0 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {dayTasks.length === 0 && (
                    <div className="text-center py-4 text-slate-400">
                      <div className="text-xs">Ei tehtäviä</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Otsikko */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Perheen tehtävälistat</h2>
        <p className="text-slate-600">Hallinnoi päivittäisiä tehtäviä ja suunnittele viikkoa</p>
      </div>

      {/* Kokonaisedistyminen */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Kokonaisedistyminen</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {people.map(person => {
            const todayStats = getTaskStats(person, 'today');
            const allStats = getTaskStats(person, 'week');
            return (
              <div key={person.id} className={`${person.bgColor} rounded-xl p-4 border border-slate-200/50`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <User className={`h-5 w-5 ${person.color}`} />
                    <span className="font-semibold text-slate-800">{person.name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                      <span>Tänään</span>
                      <span>{todayStats.completed}/{todayStats.total}</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${person.color.replace('text-', 'bg-')}`}
                        style={{ width: `${todayStats.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">
                    Yhteensä: {allStats.completed}/{allStats.total} tehtävää ({allStats.percentage}%)
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Jaettujen tehtävien tilastot */}
          <div className="bg-orange-50 rounded-xl p-4 border border-slate-200/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-slate-800">Jaetut tehtävät</span>
              </div>
              <span className="text-sm text-slate-600">
                {sharedStats.completed}/{sharedStats.total} tehtävää
              </span>
            </div>
            <div className="w-full bg-white rounded-full h-2 mb-2">
              <div 
                className="h-2 rounded-full transition-all duration-300 bg-orange-600"
                style={{ width: `${sharedStats.percentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-slate-600">
              {sharedStats.percentage}% valmis
            </div>
          </div>
        </div>
      </div>

      {/* Yksittäiset tehtävälistat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {people.map(person => (
          <div key={person.id} className="bg-white rounded-xl border border-slate-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`${person.bgColor} p-3 rounded-lg`}>
                  <User className={`h-6 w-6 ${person.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">{person.name}n tehtävät</h3>
                  <p className="text-sm text-slate-600">
                    {personViews[person.id] === 'today' 
                      ? `${getFilteredTasks(person).filter(task => !task.completed).length} jäljellä tänään`
                      : `${person.tasks.filter(task => !task.completed).length} tehtävää yhteensä`
                    }
                  </p>
                </div>
              </div>
              
              {/* Henkilökohtainen näkymävalinta */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setPersonViews({ ...personViews, [person.id]: 'today' })}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    personViews[person.id] === 'today' 
                      ? 'bg-white text-slate-800 shadow' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Tänään
                </button>
                <button
                  onClick={() => setPersonViews({ ...personViews, [person.id]: 'week' })}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    personViews[person.id] === 'week' 
                      ? 'bg-white text-slate-800 shadow' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Viikko
                </button>
              </div>
            </div>

            {/* Näytä viikkonäkymä tai päivänäkymä */}
            {personViews[person.id] === 'week' ? (
              renderWeekView(person)
            ) : (
              <>
                {/* Lisää uusi tehtävä */}
                <div className="mb-6 space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Lisää uusi tehtävä..."
                      value={newTask[person.id] || ''}
                      onChange={(e) => setNewTask({ ...newTask, [person.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && addTask(person.id)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => addTask(person.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Asetukset */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Prioriteettivalitsin */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">Prioriteetti:</span>
                        <select
                          value={selectedPriority[person.id] || 'medium'}
                          onChange={(e) => setSelectedPriority({ ...selectedPriority, [person.id]: e.target.value as 'low' | 'medium' | 'high' })}
                          className="text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Matala</option>
                          <option value="medium">Keskitaso</option>
                          <option value="high">Korkea</option>
                        </select>
                      </div>

                      {/* Jaettu tehtävä -valitsin */}
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSharedTask[person.id] || false}
                            onChange={(e) => setIsSharedTask({ ...isSharedTask, [person.id]: e.target.checked })}
                            className="text-orange-600 focus:ring-orange-500 rounded"
                          />
                          <span className="text-sm text-slate-600 flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>Jaettu tehtävä</span>
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Ajankohta */}
                    <div className="space-y-2">
                      <span className="text-sm text-slate-600">Ajankohta:</span>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`dueDateType-${person.id}`}
                            value="none"
                            checked={(taskDueDateType[person.id] || 'none') === 'none'}
                            onChange={(e) => setTaskDueDateType({ ...taskDueDateType, [person.id]: e.target.value as any })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">Tämän päivän tehtävä</span>
                        </label>
                        
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`dueDateType-${person.id}`}
                            value="specific"
                            checked={(taskDueDateType[person.id] || 'none') === 'specific'}
                            onChange={(e) => setTaskDueDateType({ ...taskDueDateType, [person.id]: e.target.value as any })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">Tietty päivämäärä</span>
                        </label>
                        
                        {taskDueDateType[person.id] === 'specific' && (
                          <input
                            type="date"
                            value={taskDueDate[person.id] || ''}
                            onChange={(e) => setTaskDueDate({ ...taskDueDate, [person.id]: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="ml-6 px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`dueDateType-${person.id}`}
                            value="within_week"
                            checked={(taskDueDateType[person.id] || 'none') === 'within_week'}
                            onChange={(e) => setTaskDueDateType({ ...taskDueDateType, [person.id]: e.target.value as any })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">Viikon sisällä hoidettava</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Selitys jaetulle tehtävälle */}
                  {isSharedTask[person.id] && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-orange-800">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Kumpi kerkeää -tehtävä</span>
                      </div>
                      <p className="text-xs text-orange-700 mt-1">
                        Tämä tehtävä näkyy molempien listoissa. Ensimmäinen joka merkitsee sen valmiiksi, saa siitä kunnian!
                      </p>
                    </div>
                  )}
                </div>

                {/* Viikon sisällä hoidettavat tehtävät - näkyy molemmissa näkymissä */}
                {getPersonWeeklyTasks(person).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span>Viikon sisällä hoidettavat ({getPersonWeeklyTasks(person).filter(task => !task.completed).length})</span>
                    </h4>
                    <div className="space-y-2 bg-green-50 rounded-lg p-3 border border-green-200">
                      {getPersonWeeklyTasks(person).map(task => (
                        <div
                          key={task.id}
                          className={`flex items-center space-x-3 p-2 rounded-lg border transition-all duration-200 ${
                            task.completed 
                              ? 'bg-white border-slate-200 opacity-60' 
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          } ${task.isShared ? 'border-l-4 border-l-orange-400' : ''}`}
                        >
                          <button
                            onClick={() => toggleTask(person.id, task.id)}
                            className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                              task.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-slate-300 hover:border-green-500'
                            }`}
                          >
                            {task.completed && <Check className="h-2 w-2" />}
                          </button>
                          
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                {task.text}
                              </span>
                              {task.isShared && (
                                <div className="flex items-center space-x-1">
                                  <Users className="h-2 w-2 text-orange-600" />
                                  <span className="text-xs text-orange-600 bg-orange-100 px-1 py-0.5 rounded">
                                    Kumpi kerkeää
                                  </span>
                                </div>
                              )}
                            </div>
                            {task.isShared && task.completed && task.completedBy && (
                              <div className="text-xs text-green-600 mt-1">
                                ✓ Tehty: {task.completedBy}
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => deleteTask(person.id, task.id)}
                            className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tehtävälista */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getFilteredTasks(person).filter(task => task.category !== 'weekly').map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                        task.completed 
                          ? 'bg-slate-50 border-slate-200 opacity-60' 
                          : isTaskOverdue(task)
                          ? 'bg-red-50 border-red-200'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      } ${task.isShared ? 'border-l-4 border-l-orange-400' : ''}`}
                    >
                      <button
                        onClick={() => toggleTask(person.id, task.id)}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                          task.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-slate-300 hover:border-green-500'
                        }`}
                      >
                        {task.completed && <Check className="h-3 w-3" />}
                      </button>
                      
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {task.text}
                          </span>
                          {task.isShared && (
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3 text-orange-600" />
                              <span className="text-xs text-orange-600 bg-orange-100 px-1 py-0.5 rounded">
                                Kumpi kerkeää
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Näytä päivämäärä jos on asetettu */}
                        {task.dueDate && (
                          <div className={`text-xs mt-1 flex items-center space-x-1 ${
                            isTaskOverdue(task) ? 'text-red-600 font-medium' : 
                            isTaskDueToday(task) ? 'text-blue-600 font-medium' : 'text-slate-600'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDueDate(task.dueDate)}</span>
                            {isTaskOverdue(task) && <span>(Myöhässä)</span>}
                            {isTaskDueToday(task) && <span>(Tänään)</span>}
                          </div>
                        )}
                        
                        {task.isShared && task.completed && task.completedBy && (
                          <div className="text-xs text-green-600 mt-1">
                            ✓ Tehty: {task.completedBy}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => deleteTask(person.id, task.id)}
                        className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {getFilteredTasks(person).filter(task => task.category !== 'weekly').length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Ei tehtäviä tässä näkymässä</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoLists;