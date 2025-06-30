import React, { useState } from 'react';
import { Plus, Check, X, User, Users, Clock, Calendar, ChevronDown, ChevronUp, Filter, Edit2, Trash2, UserPlus } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  isShared?: boolean;
  sharedWith?: string[]; // Henkilöt joita jaettu tehtävä koskee
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
        { id: 5, text: 'Vie roskat ulos', completed: false, priority: 'medium', isShared: true, sharedWith: ['person1', 'person2'], category: 'today' },
        { id: 6, text: 'Käy apteekissa', completed: true, priority: 'medium', isShared: true, sharedWith: ['person1', 'person2'], completedBy: 'Äiti', category: 'today' },
        { id: 7, text: 'Siivoa kylpyhuone', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly' },
        { id: 8, text: 'Varaa kesäloma', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 30), dueDateType: 'specific', category: 'scheduled' },
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
        { id: 5, text: 'Vie roskat ulos', completed: false, priority: 'medium', isShared: true, sharedWith: ['person1', 'person2'], category: 'today' },
        { id: 6, text: 'Käy apteekissa', completed: true, priority: 'medium', isShared: true, sharedWith: ['person1', 'person2'], completedBy: 'Äiti', category: 'today' },
        { id: 13, text: 'Osta uusi työkalupakki', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly' },
      ]
    }
  ]);

  const [newTask, setNewTask] = useState<{ [key: string]: string }>({});
  const [selectedPriority, setSelectedPriority] = useState<{ [key: string]: 'low' | 'medium' | 'high' }>({});
  const [isSharedTask, setIsSharedTask] = useState<{ [key: string]: boolean }>({});
  const [selectedSharedWith, setSelectedSharedWith] = useState<{ [key: string]: string[] }>({});
  const [taskDueDate, setTaskDueDate] = useState<{ [key: string]: string }>({});
  const [taskDueDateType, setTaskDueDateType] = useState<{ [key: string]: 'none' | 'specific' | 'within_week' }>({});
  
  const [showScheduledTasks, setShowScheduledTasks] = useState(false);
  const [showWeeklyTasks, setShowWeeklyTasks] = useState(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'today' | 'scheduled' | 'weekly'>('today');
  
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [selectedTask, setSelectedTask] = useState<{ task: Task; personId: string } | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const addPerson = () => {
    if (!newPersonName.trim()) return;

    const colors = [
      { color: 'text-green-600', bgColor: 'bg-green-50' },
      { color: 'text-red-600', bgColor: 'bg-red-50' },
      { color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      { color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
      { color: 'text-pink-600', bgColor: 'bg-pink-50' },
      { color: 'text-teal-600', bgColor: 'bg-teal-50' },
    ];

    const colorIndex = (people.length - 2) % colors.length;
    const selectedColor = colors[colorIndex];

    const newPerson: Person = {
      id: `person${Date.now()}`,
      name: newPersonName.trim(),
      color: selectedColor.color,
      bgColor: selectedColor.bgColor,
      tasks: []
    };

    setPeople([...people, newPerson]);
    setNewPersonName('');
    setShowAddPersonModal(false);
  };

  const removePerson = (personId: string) => {
    if (people.length <= 2) return; // Estä alle kahden henkilön poistaminen
    
    // Poista henkilö ja hänen tehtävänsä
    const updatedPeople = people.filter(person => person.id !== personId);
    
    // Poista henkilö myös jaettujen tehtävien sharedWith-listasta
    const cleanedPeople = updatedPeople.map(person => ({
      ...person,
      tasks: person.tasks.map(task => {
        if (task.isShared && task.sharedWith) {
          const updatedSharedWith = task.sharedWith.filter(id => id !== personId);
          // Jos jaettu tehtävä jää vain yhdelle henkilölle, muuta se henkilökohtaiseksi
          if (updatedSharedWith.length <= 1) {
            return { ...task, isShared: false, sharedWith: undefined };
          }
          return { ...task, sharedWith: updatedSharedWith };
        }
        return task;
      })
    }));
    
    setPeople(cleanedPeople);
  };

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

    const sharedWith = isSharedTask[personId] 
      ? (selectedSharedWith[personId]?.length > 0 ? selectedSharedWith[personId] : [personId])
      : undefined;

    const newTaskObj: Task = {
      id: Date.now(),
      text: taskText,
      completed: false,
      priority: selectedPriority[personId] || 'medium',
      isShared: isSharedTask[personId] || false,
      sharedWith,
      dueDate,
      dueDateType: dueDateType === 'none' ? undefined : dueDateType,
      category
    };

    if (isSharedTask[personId] && sharedWith) {
      // Lisää jaettu tehtävä valituille henkilöille
      setPeople(people.map(person => 
        sharedWith.includes(person.id)
          ? { ...person, tasks: [...person.tasks, newTaskObj] }
          : person
      ));
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
    setSelectedSharedWith({ ...selectedSharedWith, [personId]: [] });
    setTaskDueDate({ ...taskDueDate, [personId]: '' });
    setTaskDueDateType({ ...taskDueDateType, [personId]: 'none' });
  };

  const toggleTask = (personId: string, taskId: number) => {
    const person = people.find(p => p.id === personId);
    const task = person?.tasks.find(t => t.id === taskId);
    
    if (!task) return;

    if (task.isShared && task.sharedWith) {
      // Jaettu tehtävä - merkitse valmiiksi kaikille jaetuille henkilöille
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
    
    if (task?.isShared && task.sharedWith) {
      // Poista jaettu tehtävä kaikilta jaetuiltä henkilöiltä
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

  const updateTask = (updatedTask: Task) => {
    if (updatedTask.isShared && updatedTask.sharedWith) {
      // Päivitä jaettu tehtävä kaikille jaetuille henkilöille
      setPeople(people.map(person => ({
        ...person,
        tasks: person.tasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      })));
    } else {
      // Päivitä henkilökohtainen tehtävä
      setPeople(people.map(person => ({
        ...person,
        tasks: person.tasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      })));
    }
    setEditingTask(null);
  };

  const toggleSharedWithPerson = (personId: string, targetPersonId: string) => {
    const currentSharedWith = selectedSharedWith[personId] || [];
    const isSelected = currentSharedWith.includes(targetPersonId);
    
    if (isSelected) {
      setSelectedSharedWith({
        ...selectedSharedWith,
        [personId]: currentSharedWith.filter(id => id !== targetPersonId)
      });
    } else {
      setSelectedSharedWith({
        ...selectedSharedWith,
        [personId]: [...currentSharedWith, targetPersonId]
      });
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

  const getTaskStats = (person: Person, category?: 'today' | 'scheduled' | 'weekly') => {
    const filteredTasks = category 
      ? person.tasks.filter(task => task.category === category)
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

  // Suodata tehtävät kategorian mukaan
  const getFilteredTasks = (person: Person) => {
    if (viewFilter === 'all') return person.tasks;
    return person.tasks.filter(task => task.category === viewFilter);
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

  // Hae ajoitetut tehtävät (ei tämän päivän)
  const getScheduledTasks = () => {
    const allTasks = people.flatMap(person => 
      person.tasks.filter(task => 
        task.category === 'scheduled' && 
        !isTaskDueToday(task) && 
        !task.completed
      ).map(task => ({ ...task, personName: person.name, personId: person.id }))
    );
    
    // Poista duplikaatit jaetuista tehtävistä
    const uniqueTasks = allTasks.filter((task, index, arr) => 
      arr.findIndex(t => t.id === task.id) === index
    );
    
    return uniqueTasks.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  };

  // Hae viikon sisällä hoidettavat tehtävät
  const getWeeklyTasks = () => {
    const allTasks = people.flatMap(person => 
      person.tasks.filter(task => 
        task.category === 'weekly' && 
        !task.completed
      ).map(task => ({ ...task, personName: person.name, personId: person.id }))
    );
    
    // Poista duplikaatit jaetuista tehtävistä
    const uniqueTasks = allTasks.filter((task, index, arr) => 
      arr.findIndex(t => t.id === task.id) === index
    );
    
    return uniqueTasks;
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

  const getSharedWithNames = (task: Task) => {
    if (!task.sharedWith) return '';
    return task.sharedWith
      .map(id => people.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Otsikko */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Perheen tehtävälistat</h2>
          <p className="text-slate-600">Hallinnoi päivittäisiä tehtäviä ja suunnittele viikkoa</p>
        </div>
        <button
          onClick={() => setShowAddPersonModal(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <UserPlus className="h-4 w-4" />
          <span>Lisää henkilö</span>
        </button>
      </div>

      {/* Näkymäsuodatin */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Näkymä</span>
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'today', label: 'Tämän päivän tehtävät', icon: '📅' },
            { key: 'scheduled', label: 'Ajoitetut tehtävät', icon: '📋' },
            { key: 'weekly', label: 'Viikon sisällä', icon: '📆' },
            { key: 'all', label: 'Kaikki tehtävät', icon: '📝' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setViewFilter(filter.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                viewFilter === filter.key
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Kokonaisedistyminen */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          {viewFilter === 'today' && 'Tämän päivän edistyminen'}
          {viewFilter === 'scheduled' && 'Ajoitettujen tehtävien edistyminen'}
          {viewFilter === 'weekly' && 'Viikkotehtävien edistyminen'}
          {viewFilter === 'all' && 'Kokonaisedistyminen'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {people.map(person => {
            const stats = getTaskStats(person, viewFilter === 'all' ? undefined : viewFilter);
            return (
              <div key={person.id} className={`${person.bgColor} rounded-xl p-4 border border-slate-200/50`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <User className={`h-5 w-5 ${person.color}`} />
                    <span className="font-semibold text-slate-800">{person.name}</span>
                  </div>
                  <span className="text-sm text-slate-600">
                    {stats.completed}/{stats.total} tehtävää
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${person.color.replace('text-', 'bg-')}`}
                    style={{ width: `${stats.percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-slate-600">
                  {stats.percentage}% valmis
                </div>
              </div>
            );
          })}
          
          {/* Jaettujen tehtävien tilastot */}
          {viewFilter === 'all' && (
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
          )}
        </div>
      </div>

      {/* Yksittäiset tehtävälistat */}
      <div className="space-y-6">
        {/* Ensimmäiset kaksi henkilöä rinnakkain */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {people.slice(0, 2).map(person => (
            <div key={person.id} className="bg-white rounded-xl border border-slate-200/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`${person.bgColor} p-3 rounded-lg`}>
                  <User className={`h-6 w-6 ${person.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-800">{person.name}n tehtävät</h3>
                  <p className="text-sm text-slate-600">
                    {getFilteredTasks(person).filter(task => !task.completed).length} jäljellä
                    {viewFilter === 'today' && ' tänään'}
                    {viewFilter === 'scheduled' && ' ajoitettuna'}
                    {viewFilter === 'weekly' && ' viikolla'}
                  </p>
                </div>
                {people.length > 2 && (
                  <button
                    onClick={() => removePerson(person.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

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

                  {/* Henkilövalinta jaetuille tehtäville (näkyy vain jos henkilöitä on enemmän kuin 2) */}
                  {isSharedTask[person.id] && people.length > 2 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="mb-2">
                        <span className="text-sm font-medium text-orange-800">Valitse henkilöt joita tehtävä koskee:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {people.map(p => (
                          <label key={p.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(selectedSharedWith[person.id] || []).includes(p.id)}
                              onChange={() => toggleSharedWithPerson(person.id, p.id)}
                              className="text-orange-600 focus:ring-orange-500 rounded"
                            />
                            <span className="text-sm text-orange-800">{p.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

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
                {isSharedTask[person.id] && people.length <= 2 && (
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

              {/* Tehtävälista */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {/* Tämän päivän tehtävät */}
                {getFilteredTasks(person).filter(task => task.category === 'today' || (viewFilter === 'all' && task.category === 'today')).map(task => (
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
                              {people.length > 2 ? getSharedWithNames(task) : 'Kumpi kerkeää'}
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
                      onClick={() => setSelectedTask({ task, personId: person.id })}
                      className="flex-shrink-0 text-slate-400 hover:text-blue-500 transition-colors duration-200"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteTask(person.id, task.id)}
                      className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Viikon sisällä hoidettavat tehtävät */}
                {(viewFilter === 'all' || viewFilter === 'weekly') && (
                  <>
                    {getFilteredTasks(person).filter(task => task.category === 'weekly').length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                        <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Viikon sisällä hoidettavat ({getFilteredTasks(person).filter(task => task.category === 'weekly' && !task.completed).length})</span>
                        </h4>
                        <div className="space-y-2">
                          {getFilteredTasks(person).filter(task => task.category === 'weekly').map(task => (
                            <div
                              key={task.id}
                              className={`flex items-center space-x-3 p-2 rounded-lg border transition-all duration-200 ${
                                task.completed 
                                  ? 'bg-white border-green-200 opacity-60' 
                                  : 'bg-white border-green-200 hover:bg-green-50'
                              } ${task.isShared ? 'border-l-4 border-l-orange-400' : ''}`}
                            >
                              <button
                                onClick={() => toggleTask(person.id, task.id)}
                                className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                                  task.completed
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-green-300 hover:border-green-500'
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
                                        {people.length > 2 ? getSharedWithNames(task) : 'Kumpi kerkeää'}
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
                                onClick={() => setSelectedTask({ task, personId: person.id })}
                                className="flex-shrink-0 text-slate-400 hover:text-blue-500 transition-colors duration-200"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              
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
                  </>
                )}
                
                {getFilteredTasks(person).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Ei tehtäviä tässä kategoriassa</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Lisähenkilöt mukautuvassa asettelussa */}
        {people.length > 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.slice(2).map(person => (
              <div key={person.id} className="bg-white rounded-xl border border-slate-200/50 p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className={`${person.bgColor} p-2 rounded-lg`}>
                    <User className={`h-4 w-4 ${person.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800">{person.name}</h3>
                    <p className="text-xs text-slate-600">
                      {getFilteredTasks(person).filter(task => !task.completed).length} jäljellä
                    </p>
                  </div>
                  <button
                    onClick={() => removePerson(person.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {/* Kompakti tehtävien lisäys */}
                <div className="mb-4 space-y-2">
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      placeholder="Uusi tehtävä..."
                      value={newTask[person.id] || ''}
                      onChange={(e) => setNewTask({ ...newTask, [person.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && addTask(person.id)}
                      className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => addTask(person.id)}
                      className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  
                  {/* Kompaktit asetukset */}
                  <div className="flex items-center space-x-2 text-xs">
                    <select
                      value={selectedPriority[person.id] || 'medium'}
                      onChange={(e) => setSelectedPriority({ ...selectedPriority, [person.id]: e.target.value as any })}
                      className="text-xs border border-slate-300 rounded px-1 py-0.5"
                    >
                      <option value="low">Matala</option>
                      <option value="medium">Keskitaso</option>
                      <option value="high">Korkea</option>
                    </select>
                    
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={isSharedTask[person.id] || false}
                        onChange={(e) => setIsSharedTask({ ...isSharedTask, [person.id]: e.target.checked })}
                        className="text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="text-xs text-slate-600">Jaettu</span>
                    </label>
                  </div>

                  {/* Henkilövalinta jaetuille tehtäville */}
                  {isSharedTask[person.id] && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-2">
                      <div className="text-xs font-medium text-orange-800 mb-1">Valitse henkilöt:</div>
                      <div className="flex flex-wrap gap-1">
                        {people.map(p => (
                          <label key={p.id} className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(selectedSharedWith[person.id] || []).includes(p.id)}
                              onChange={() => toggleSharedWithPerson(person.id, p.id)}
                              className="text-orange-600 focus:ring-orange-500 rounded"
                            />
                            <span className="text-xs text-orange-800">{p.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Kompakti tehtävälista */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {/* Tämän päivän tehtävät */}
                  {getFilteredTasks(person).filter(task => task.category === 'today' || (viewFilter === 'all' && task.category === 'today')).map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center space-x-2 p-2 rounded border text-sm transition-all duration-200 ${
                        task.completed 
                          ? 'bg-slate-50 border-slate-200 opacity-60' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      } ${task.isShared ? 'border-l-2 border-l-orange-400' : ''}`}
                    >
                      <button
                        onClick={() => toggleTask(person.id, task.id)}
                        className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                          task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'
                        }`}
                      >
                        {task.completed && <Check className="h-2 w-2" />}
                      </button>
                      
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                      
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {task.text}
                        </span>
                        {task.isShared && (
                          <div className="text-xs text-orange-600 mt-0.5">
                            {getSharedWithNames(task)}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setSelectedTask({ task, personId: person.id })}
                        className="text-slate-400 hover:text-blue-500"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      
                      <button
                        onClick={() => deleteTask(person.id, task.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Viikkotehtävät */}
                  {(viewFilter === 'all' || viewFilter === 'weekly') && getFilteredTasks(person).filter(task => task.category === 'weekly').length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <div className="text-xs font-medium text-green-800 mb-2">Viikon sisällä</div>
                      <div className="space-y-1">
                        {getFilteredTasks(person).filter(task => task.category === 'weekly').map(task => (
                          <div
                            key={task.id}
                            className={`flex items-center space-x-2 p-1 rounded border text-xs ${
                              task.completed ? 'bg-white border-green-200 opacity-60' : 'bg-white border-green-200'
                            }`}
                          >
                            <button
                              onClick={() => toggleTask(person.id, task.id)}
                              className={`flex-shrink-0 w-3 h-3 rounded border flex items-center justify-center ${
                                task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-green-300'
                              }`}
                            >
                              {task.completed && <Check className="h-1.5 w-1.5" />}
                            </button>
                            
                            <span className={`flex-1 ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                              {task.text}
                            </span>
                            
                            <button
                              onClick={() => setSelectedTask({ task, personId: person.id })}
                              className="text-slate-400 hover:text-blue-500"
                            >
                              <Edit2 className="h-2 w-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
                  placeholder="Syötä henkilön nimi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Lisää henkilö
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tehtävän tarkastelu/muokkaus -modaali */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Tehtävän tiedot</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tehtävä</label>
                <div className="text-slate-800">{selectedTask.task.text}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prioriteetti</label>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedTask.task.priority)}`} />
                  <span className="text-slate-800">{getPriorityLabel(selectedTask.task.priority)}</span>
                </div>
              </div>
              
              {selectedTask.task.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Määräaika</label>
                  <div className="text-slate-800">{formatDueDate(selectedTask.task.dueDate)}</div>
                </div>
              )}
              
              {selectedTask.task.dueDateType === 'within_week' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ajankohta</label>
                  <div className="text-slate-800">Viikon sisällä hoidettava</div>
                </div>
              )}
              
              {selectedTask.task.isShared && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Jaettu tehtävä</label>
                  <div className="text-slate-800">
                    {people.length > 2 ? getSharedWithNames(selectedTask.task) : 'Kumpi kerkeää -tehtävä'}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tila</label>
                <div className={`text-sm ${selectedTask.task.completed ? 'text-green-600' : 'text-orange-600'}`}>
                  {selectedTask.task.completed ? 'Valmis' : 'Kesken'}
                  {selectedTask.task.completed && selectedTask.task.completedBy && (
                    <span className="ml-2">({selectedTask.task.completedBy})</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => {
                  setEditingTask(selectedTask.task);
                  setSelectedTask(null);
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Edit2 className="h-4 w-4" />
                <span>Muokkaa</span>
              </button>
              
              <button
                onClick={() => {
                  toggleTask(selectedTask.personId, selectedTask.task.id);
                  setSelectedTask(null);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  selectedTask.task.completed
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Check className="h-4 w-4" />
                <span>{selectedTask.task.completed ? 'Merkitse keskeneräiseksi' : 'Merkitse valmiiksi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tehtävän muokkaus -modaali */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Muokkaa tehtävää</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tehtävän nimi</label>
                <input
                  type="text"
                  value={editingTask.text}
                  onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prioriteetti</label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Matala</option>
                  <option value="medium">Keskitaso</option>
                  <option value="high">Korkea</option>
                </select>
              </div>
              
              {editingTask.isShared && people.length > 2 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Jaettu henkilöiden kanssa</label>
                  <div className="space-y-2">
                    {people.map(person => (
                      <label key={person.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(editingTask.sharedWith || []).includes(person.id)}
                          onChange={(e) => {
                            const currentSharedWith = editingTask.sharedWith || [];
                            if (e.target.checked) {
                              setEditingTask({
                                ...editingTask,
                                sharedWith: [...currentSharedWith, person.id]
                              });
                            } else {
                              setEditingTask({
                                ...editingTask,
                                sharedWith: currentSharedWith.filter(id => id !== person.id)
                              });
                            }
                          }}
                          className="text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-slate-800">{person.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Määräaika</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editDueDateType"
                      checked={!editingTask.dueDate && editingTask.dueDateType !== 'within_week'}
                      onChange={() => setEditingTask({ ...editingTask, dueDate: undefined, dueDateType: undefined, category: 'today' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700">Tämän päivän tehtävä</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editDueDateType"
                      checked={!!editingTask.dueDate}
                      onChange={() => setEditingTask({ 
                        ...editingTask, 
                        dueDate: new Date(), 
                        dueDateType: 'specific',
                        category: 'scheduled'
                      })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700">Tietty päivämäärä</span>
                  </label>
                  
                  {editingTask.dueDate && (
                    <input
                      type="date"
                      value={editingTask.dueDate.toISOString().split('T')[0]}
                      onChange={(e) => setEditingTask({ 
                        ...editingTask, 
                        dueDate: new Date(e.target.value)
                      })}
                      className="ml-6 px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editDueDateType"
                      checked={editingTask.dueDateType === 'within_week'}
                      onChange={() => setEditingTask({ 
                        ...editingTask, 
                        dueDate: undefined, 
                        dueDateType: 'within_week',
                        category: 'weekly'
                      })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700">Viikon sisällä hoidettava</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
              >
                Peruuta
              </button>
              <button
                onClick={() => updateTask(editingTask)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Tallenna muutokset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoLists;