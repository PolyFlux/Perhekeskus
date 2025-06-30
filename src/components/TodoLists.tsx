import React, { useState } from 'react';
import { Plus, Check, X, User, Calendar, Clock, AlertCircle, UserPlus, Trash2, Users } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category: string;
  assignedTo: string[];
  assignmentType: 'individual' | 'shared';
}

interface PersonViewState {
  [personName: string]: 'today' | 'week' | 'upcoming';
}

const TodoLists: React.FC = () => {
  const [people, setPeople] = useState<string[]>(['Isi', 'Äiti']);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Ruokaostokset', completed: false, priority: 'high', dueDate: new Date(), category: 'Kotitalous', assignedTo: ['Äiti'], assignmentType: 'individual' },
    { id: 2, title: 'Hae kuivapesu', completed: false, priority: 'medium', dueDate: new Date(Date.now() + 86400000), category: 'Asiointi', assignedTo: ['Isi'], assignmentType: 'individual' },
    { id: 3, title: 'Työprojektin deadline', completed: false, priority: 'high', dueDate: new Date(Date.now() + 604800000), category: 'Työ', assignedTo: ['Isi'], assignmentType: 'individual' },
    { id: 4, title: 'Synttärilahjan osto', completed: false, priority: 'medium', dueDate: new Date(Date.now() + 1209600000), category: 'Perhe', assignedTo: ['Äiti'], assignmentType: 'individual' },
    { id: 5, title: 'Siivoa olohuone', completed: false, priority: 'medium', dueDate: new Date(), category: 'Kotitalous', assignedTo: ['Isi', 'Äiti'], assignmentType: 'shared' },
  ]);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [personViews, setPersonViews] = useState<PersonViewState>({
    'Äiti': 'today',
    'Isi': 'today'
  });

  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Kotitalous',
    assignmentType: 'individual' as 'individual' | 'shared',
    assignedTo: ['Äiti'],
    selectedPeople: [] as string[]
  });

  const categories = ['Kotitalous', 'Asiointi', 'Urheilu', 'Koulu', 'Terveys', 'Työ', 'Perhe', 'Muu'];

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  };

  const priorityLabels = {
    low: 'Matala',
    medium: 'Keskitaso',
    high: 'Korkea'
  };

  const viewTabs = [
    { key: 'today', label: 'Tänään', icon: Calendar },
    { key: 'week', label: 'Tämä viikko', icon: Clock },
    { key: 'upcoming', label: 'Tulevat', icon: AlertCircle }
  ];

  const dayNames = ['Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai', 'Sunnuntai'];

  const addPerson = () => {
    if (!newPersonName.trim()) return;
    if (people.includes(newPersonName.trim())) {
      alert('Henkilö on jo olemassa!');
      return;
    }

    const personName = newPersonName.trim();
    setPeople([...people, personName]);
    setPersonViews(prev => ({
      ...prev,
      [personName]: 'today'
    }));
    setNewPersonName('');
    setShowAddPersonModal(false);
  };

  const removePerson = (personName: string) => {
    // Estä oletushenkilöiden poistaminen
    if (personName === 'Isi' || personName === 'Äiti') {
      alert('Oletushenkilöitä (Isi ja Äiti) ei voi poistaa.');
      return;
    }

    // Poista henkilö tehtävien assignedTo-listoista
    setTasks(tasks.map(task => {
      const updatedAssignedTo = task.assignedTo.filter(person => person !== personName);
      // Jos tehtävällä ei ole enää ketään vastuussa, siirrä ensimmäiselle henkilölle
      if (updatedAssignedTo.length === 0) {
        return { ...task, assignedTo: [people[0]], assignmentType: 'individual' as const };
      }
      return { ...task, assignedTo: updatedAssignedTo };
    }));

    // Poista henkilö
    setPeople(people.filter(p => p !== personName));
    const newPersonViews = { ...personViews };
    delete newPersonViews[personName];
    setPersonViews(newPersonViews);
  };

  const setPersonView = (person: string, view: 'today' | 'week' | 'upcoming') => {
    setPersonViews(prev => ({
      ...prev,
      [person]: view
    }));
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;

    let assignedTo: string[];
    if (newTask.assignmentType === 'individual') {
      assignedTo = [newTask.assignedTo[0]];
    } else {
      assignedTo = newTask.selectedPeople.length > 0 ? newTask.selectedPeople : people;
    }

    const task: Task = {
      id: Date.now(),
      title: newTask.title.trim(),
      completed: false,
      priority: newTask.priority,
      dueDate: new Date(newTask.dueDate),
      category: newTask.category,
      assignedTo: assignedTo,
      assignmentType: newTask.assignmentType
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      category: 'Kotitalous',
      assignmentType: 'individual',
      assignedTo: [people[0] || 'Äiti'],
      selectedPeople: []
    });
    setShowAddTaskModal(false);
  };

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (date: Date) => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Maanantai
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunnuntai
    
    return date >= weekStart && date <= weekEnd;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getWeekDays = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Maanantai
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getTasksForDay = (person: string, date: Date) => {
    return tasks.filter(task => 
      task.assignedTo.includes(person) && 
      task.dueDate && 
      isSameDay(task.dueDate, date)
    );
  };

  const getFilteredTasks = (person: string, view: 'today' | 'week' | 'upcoming') => {
    const personTasks = tasks.filter(task => task.assignedTo.includes(person));
    
    switch (view) {
      case 'today':
        return personTasks.filter(task => task.dueDate && isToday(task.dueDate));
      case 'week':
        return personTasks.filter(task => task.dueDate && isThisWeek(task.dueDate));
      case 'upcoming':
        return personTasks.filter(task => task.dueDate && task.dueDate > new Date());
      default:
        return personTasks;
    }
  };

  const getPersonStats = (person: string) => {
    const personTasks = tasks.filter(task => task.assignedTo.includes(person));
    const todayTasks = personTasks.filter(task => task.dueDate && isToday(task.dueDate));
    const completedToday = todayTasks.filter(task => task.completed).length;
    const totalToday = todayTasks.length;
    const overdueTasks = personTasks.filter(task => 
      task.dueDate && task.dueDate < new Date() && !task.completed
    ).length;

    return { completedToday, totalToday, overdueTasks };
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (isToday(date)) return 'Tänään';
    if (date.toDateString() === tomorrow.toDateString()) return 'Huomenna';
    
    return date.toLocaleDateString('fi-FI', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatDayDate = (date: Date) => {
    const today = new Date();
    if (isToday(date)) return 'Tänään';
    
    return date.toLocaleDateString('fi-FI', { 
      day: 'numeric', 
      month: 'numeric' 
    });
  };

  const formatAssignees = (task: Task) => {
    if (task.assignmentType === 'shared') {
      if (task.assignedTo.length === people.length) {
        return 'Kuka tahansa';
      }
      return task.assignedTo.join(', ');
    }
    return task.assignedTo[0];
  };

  const togglePersonSelection = (person: string) => {
    setNewTask(prev => ({
      ...prev,
      selectedPeople: prev.selectedPeople.includes(person)
        ? prev.selectedPeople.filter(p => p !== person)
        : [...prev.selectedPeople, person]
    }));
  };

  const renderWeekView = (person: string) => {
    const weekDays = getWeekDays();
    
    return (
      <div className="space-y-3">
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDay(person, day);
          const isCurrentDay = isToday(day);
          
          return (
            <div key={index} className={`border rounded-lg p-3 ${
              isCurrentDay ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium text-sm ${
                  isCurrentDay ? 'text-blue-800' : 'text-slate-700'
                }`}>
                  {dayNames[index]} {formatDayDate(day)}
                </h4>
                <span className="text-xs text-slate-500">
                  {dayTasks.length} tehtävä{dayTasks.length !== 1 ? 'a' : ''}
                </span>
              </div>
              
              {dayTasks.length > 0 ? (
                <div className="space-y-2">
                  {dayTasks
                    .sort((a, b) => {
                      if (a.completed !== b.completed) {
                        return a.completed ? 1 : -1;
                      }
                      const priorityOrder = { high: 0, medium: 1, low: 2 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    })
                    .map(task => (
                      <div
                        key={task.id}
                        className={`flex items-center space-x-2 p-2 rounded border transition-all duration-200 group ${
                          task.completed 
                            ? 'bg-white border-slate-200 opacity-60' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                            task.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-slate-300 hover:border-green-500'
                          }`}
                        >
                          {task.completed && <Check className="h-2 w-2" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm truncate ${
                              task.completed ? 'line-through text-slate-500' : 'text-slate-800'
                            }`}>
                              {task.title}
                            </span>
                            <span className={`px-1 py-0.5 rounded text-xs border ${priorityColors[task.priority]}`}>
                              {task.priority === 'high' ? 'K' : task.priority === 'medium' ? 'K' : 'M'}
                            </span>
                            {task.assignmentType === 'shared' && (
                              <Users className="h-3 w-3 text-blue-500" title="Jaettu tehtävä" />
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {task.category}
                            {task.assignmentType === 'shared' && (
                              <span className="ml-2 text-blue-600">
                                ({formatAssignees(task)})
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-2 text-slate-400 text-xs">
                  Ei tehtäviä
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTaskList = (person: string, view: 'today' | 'week' | 'upcoming') => {
    if (view === 'week') {
      return renderWeekView(person);
    }

    const filteredTasks = getFilteredTasks(person, view);
    
    return (
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks
            .sort((a, b) => {
              // Järjestä: keskeneräiset ensin, sitten prioriteetin mukaan, sitten päivämäärän mukaan
              if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
              }
              
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              if (a.priority !== b.priority) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              }
              
              if (a.dueDate && b.dueDate) {
                return a.dueDate.getTime() - b.dueDate.getTime();
              }
              
              return 0;
            })
            .map(task => (
              <div
                key={task.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 group ${
                  task.completed 
                    ? 'bg-slate-50 border-slate-200 opacity-60' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                    task.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-300 hover:border-green-500'
                  }`}
                >
                  {task.completed && <Check className="h-3 w-3" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`font-medium truncate ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-800'
                    }`}>
                      {task.title}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                    {task.assignmentType === 'shared' && (
                      <span className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        <Users className="h-3 w-3" />
                        <span>Jaettu</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-600">
                    <span className="bg-slate-200 px-2 py-1 rounded-full">
                      {task.category}
                    </span>
                    {task.dueDate && (
                      <span className={`flex items-center space-x-1 ${
                        task.dueDate < new Date() && !task.completed ? 'text-red-600 font-medium' : ''
                      }`}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(task.dueDate)}</span>
                      </span>
                    )}
                    {task.assignmentType === 'shared' && (
                      <span className="text-blue-600">
                        Vastuussa: {formatAssignees(task)}
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => deleteTask(task.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            <div className="bg-slate-100 p-3 rounded-lg w-fit mx-auto mb-2">
              {React.createElement(viewTabs.find(tab => tab.key === view)?.icon || Calendar, { 
                className: 'h-8 w-8 opacity-50' 
              })}
            </div>
            <p className="text-sm">
              {view === 'today' && 'Ei tehtäviä tänään'}
              {view === 'week' && 'Ei tehtäviä tällä viikolla'}
              {view === 'upcoming' && 'Ei tulevia tehtäviä'}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Otsikko */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tehtävälistat</h2>
          <p className="text-slate-600">Hallinnoi perheen päivittäisiä tehtäviä</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddPersonModal(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <UserPlus className="h-4 w-4" />
            <span>Lisää henkilö</span>
          </button>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Lisää tehtävä</span>
          </button>
        </div>
      </div>

      {/* Henkilökohtaiset tehtävälistat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {people.map(person => {
          const stats = getPersonStats(person);
          const currentView = personViews[person] || 'today';
          const isDefaultPerson = person === 'Isi' || person === 'Äiti';
          
          return (
            <div key={person} className="bg-white rounded-xl border border-slate-200/50 overflow-hidden">
              {/* Henkilön otsikko ja tilastot */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-slate-800">{person}</h3>
                        {!isDefaultPerson && (
                          <button
                            onClick={() => removePerson(person)}
                            className="text-slate-400 hover:text-red-500 transition-colors duration-200"
                            title="Poista henkilö"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span>Tänään: {stats.completedToday}/{stats.totalToday}</span>
                        {stats.overdueTasks > 0 && (
                          <span className="text-red-600 font-medium">
                            {stats.overdueTasks} myöhässä
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Edistymispalkki */}
                  {stats.totalToday > 0 && (
                    <div className="w-16">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(stats.completedToday / stats.totalToday) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-600 text-center mt-1">
                        {Math.round((stats.completedToday / stats.totalToday) * 100)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Näkymävälilehdet */}
                <div className="flex items-center bg-white rounded-lg p-1 shadow-sm">
                  {viewTabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = currentView === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setPersonView(person, tab.key as 'today' | 'week' | 'upcoming')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1 justify-center ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tehtävälista */}
              <div className="p-4">
                <div className={`${currentView === 'week' ? 'max-h-96' : 'max-h-80'} overflow-y-auto`}>
                  {renderTaskList(person, currentView)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lisää henkilö -modaali */}
      {showAddPersonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Lisää uusi henkilö</h3>
              <button
                onClick={() => setShowAddPersonModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Henkilön nimi</label>
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Esim. Lapsi 1, Mummo, jne..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addPerson()}
                />
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Huomio:</strong> Uusi henkilö lisätään tehtävälistoihin ja voit alkaa määrittää heille tehtäviä.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddPersonModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
              >
                Peruuta
              </button>
              <button
                onClick={addPerson}
                disabled={!newPersonName.trim()}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  newPersonName.trim()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Lisää henkilö
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lisää tehtävä -modaali */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Lisää uusi tehtävä</h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tehtävä</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Syötä tehtävän nimi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Tehtävän tyyppi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Tehtävän tyyppi</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="assignmentType"
                      value="individual"
                      checked={newTask.assignmentType === 'individual'}
                      onChange={(e) => setNewTask({ ...newTask, assignmentType: e.target.value as 'individual' | 'shared' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-slate-600" />
                      <span className="text-slate-800">Henkilökohtainen tehtävä</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="assignmentType"
                      value="shared"
                      checked={newTask.assignmentType === 'shared'}
                      onChange={(e) => setNewTask({ ...newTask, assignmentType: e.target.value as 'individual' | 'shared' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-slate-800">Jaettu tehtävä (kuka tahansa voi hoitaa)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Vastuuhenkilö (henkilökohtainen tehtävä) */}
              {newTask.assignmentType === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Vastuuhenkilö</label>
                  <select
                    value={newTask.assignedTo[0] || people[0]}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: [e.target.value] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {people.map(person => (
                      <option key={person} value={person}>{person}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Henkilövalinta (jaettu tehtävä) */}
              {newTask.assignmentType === 'shared' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Kuka voi hoitaa tehtävän? (tyhjä = kuka tahansa)
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-3">
                    {people.map(person => (
                      <label key={person} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTask.selectedPeople.includes(person)}
                          onChange={() => togglePersonSelection(person)}
                          className="text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-slate-800">{person}</span>
                      </label>
                    ))}
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    {newTask.selectedPeople.length === 0 
                      ? 'Kuka tahansa voi hoitaa tehtävän'
                      : `Valittu ${newTask.selectedPeople.length} henkilö${newTask.selectedPeople.length !== 1 ? 'ä' : ''}: ${newTask.selectedPeople.join(', ')}`
                    }
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Eräpäivä</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prioriteetti</label>
                <div className="flex space-x-3">
                  {Object.entries(priorityLabels).map(([key, label]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value={key}
                        checked={newTask.priority === key}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs border ${priorityColors[key as keyof typeof priorityColors]}`}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kategoria</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Esikatselu */}
              {newTask.title && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="font-medium text-slate-800 mb-2">Esikatselu:</h4>
                  <div className="text-sm text-slate-600">
                    <p><strong>Tehtävä:</strong> {newTask.title}</p>
                    <p><strong>Tyyppi:</strong> {newTask.assignmentType === 'individual' ? 'Henkilökohtainen' : 'Jaettu'}</p>
                    <p><strong>Vastuussa:</strong> {
                      newTask.assignmentType === 'individual' 
                        ? newTask.assignedTo[0]
                        : newTask.selectedPeople.length === 0 
                          ? 'Kuka tahansa' 
                          : newTask.selectedPeople.join(', ')
                    }</p>
                    <p><strong>Prioriteetti:</strong> {priorityLabels[newTask.priority]}</p>
                    <p><strong>Kategoria:</strong> {newTask.category}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
              >
                Peruuta
              </button>
              <button
                onClick={addTask}
                disabled={!newTask.title.trim()}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  newTask.title.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Lisää tehtävä
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoLists;