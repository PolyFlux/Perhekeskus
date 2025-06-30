import React, { useState } from 'react';
import { Plus, Check, X, User, Users, Clock, Calendar, ChevronDown, ChevronUp, Filter, Edit2, Trash2 } from 'lucide-react';

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
  assignedTo?: string; // Henkilökohtaisille tehtäville
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
        { id: 1, text: 'Ruokaostokset', completed: false, priority: 'high', category: 'today', assignedTo: 'person1' },
        { id: 2, text: 'Soita hammaslääkärille ajanvarausta varten', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 25), dueDateType: 'specific', category: 'scheduled', assignedTo: 'person1' },
        { id: 3, text: 'Hae kuivapesu', completed: true, priority: 'low', category: 'today', assignedTo: 'person1' },
        { id: 4, text: 'Valmista illallinen', completed: false, priority: 'high', category: 'today', assignedTo: 'person1' },
        { id: 5, text: 'Vie roskat ulos', completed: false, priority: 'medium', isShared: true, category: 'today' },
        { id: 6, text: 'Käy apteekissa', completed: true, priority: 'medium', isShared: true, completedBy: 'Äiti', category: 'today' },
        { id: 7, text: 'Siivoa kylpyhuone', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly', assignedTo: 'person1' },
        { id: 8, text: 'Varaa kesäloma', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 30), dueDateType: 'specific', category: 'scheduled', assignedTo: 'person1' },
      ]
    },
    {
      id: 'person2',
      name: 'Isi',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      tasks: [
        { id: 9, text: 'Korjaa keittiön hana', completed: false, priority: 'high', category: 'today', assignedTo: 'person2' },
        { id: 10, text: 'Varaa auton huolto', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 28), dueDateType: 'specific', category: 'scheduled', assignedTo: 'person2' },
        { id: 11, text: 'Maksa sähkölasku', completed: true, priority: 'high', category: 'today', assignedTo: 'person2' },
        { id: 12, text: 'Siivoa autotalli', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly', assignedTo: 'person2' },
        { id: 5, text: 'Vie roskat ulos', completed: false, priority: 'medium', isShared: true, category: 'today' },
        { id: 6, text: 'Käy apteekissa', completed: true, priority: 'medium', isShared: true, completedBy: 'Äiti', category: 'today' },
        { id: 13, text: 'Osta uusi työkalupakki', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly', assignedTo: 'person2' },
      ]
    }
  ]);

  const [newTask, setNewTask] = useState<{ [key: string]: string }>({});
  const [selectedPriority, setSelectedPriority] = useState<{ [key: string]: 'low' | 'medium' | 'high' }>({});
  const [isSharedTask, setIsSharedTask] = useState<{ [key: string]: boolean }>({});
  const [taskDueDate, setTaskDueDate] = useState<{ [key: string]: string }>({});
  const [taskDueDateType, setTaskDueDateType] = useState<{ [key: string]: 'none' | 'specific' | 'within_week' }>({});
  
  const [viewFilter, setViewFilter] = useState<'all' | 'today' | 'scheduled' | 'weekly'>('today');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonColor, setNewPersonColor] = useState('text-green-600');

  const availableColors = [
    { color: 'text-green-600', bgColor: 'bg-green-50', label: 'Vihreä' },
    { color: 'text-red-600', bgColor: 'bg-red-50', label: 'Punainen' },
    { color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Keltainen' },
    { color: 'text-indigo-600', bgColor: 'bg-indigo-50', label: 'Indigo' },
    { color: 'text-pink-600', bgColor: 'bg-pink-50', label: 'Pinkki' },
    { color: 'text-teal-600', bgColor: 'bg-teal-50', label: 'Turkoosi' },
    { color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Oranssi' },
    { color: 'text-cyan-600', bgColor: 'bg-cyan-50', label: 'Syaani' },
  ];

  const addPerson = () => {
    if (!newPersonName.trim()) return;

    const selectedColorData = availableColors.find(c => c.color === newPersonColor);
    if (!selectedColorData) return;

    const newPerson: Person = {
      id: `person${Date.now()}`,
      name: newPersonName.trim(),
      color: selectedColorData.color,
      bgColor: selectedColorData.bgColor,
      tasks: []
    };

    setPeople([...people, newPerson]);
    setNewPersonName('');
    setNewPersonColor('text-green-600');
    setShowAddPersonModal(false);
  };

  const deletePerson = (personId: string) => {
    // Estä äidin ja isin poistaminen
    if (personId === 'person1' || personId === 'person2') return;

    const personToDelete = people.find(p => p.id === personId);
    if (!personToDelete) return;

    // Siirrä henkilökohtaiset tehtävät ensimmäiselle henkilölle
    const firstPerson = people[0];
    const tasksToTransfer = personToDelete.tasks.filter(task => !task.isShared);
    
    if (tasksToTransfer.length > 0) {
      setPeople(prevPeople => 
        prevPeople.map(person => 
          person.id === firstPerson.id 
            ? { 
                ...person, 
                tasks: [
                  ...person.tasks, 
                  ...tasksToTransfer.map(task => ({ ...task, assignedTo: firstPerson.id }))
                ]
              }
            : person
        )
      );
    }

    // Poista henkilö
    setPeople(people.filter(p => p.id !== personId));
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

    const newTaskObj: Task = {
      id: Date.now(),
      text: taskText,
      completed: false,
      priority: selectedPriority[personId] || 'medium',
      isShared: isSharedTask[personId] || false,
      assignedTo: isSharedTask[personId] ? undefined : personId,
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

  const openTaskModal = (task: Task, personId: string) => {
    setSelectedTask(task);
    setSelectedPersonId(personId);
    setShowTaskModal(true);
    setIsEditingTask(false);
  };

  const startEditingTask = () => {
    setEditedTask({ ...selectedTask! });
    setIsEditingTask(true);
  };

  const saveTaskChanges = () => {
    if (!editedTask || !selectedTask) return;

    // Jos tehtävän suorittajaa vaihdetaan
    if (!editedTask.isShared && editedTask.assignedTo !== selectedTask.assignedTo) {
      // Poista tehtävä vanhalta henkilöltä
      setPeople(prevPeople => 
        prevPeople.map(person => ({
          ...person,
          tasks: person.tasks.filter(task => task.id !== selectedTask.id)
        }))
      );
      
      // Lisää tehtävä uudelle henkilölle
      setPeople(prevPeople => 
        prevPeople.map(person => 
          person.id === editedTask.assignedTo 
            ? { ...person, tasks: [...person.tasks, editedTask] }
            : person
        )
      );
    } else {
      // Päivitä tehtävä normaalisti
      if (editedTask.isShared) {
        // Jaettu tehtävä - päivitä molemmille
        setPeople(people.map(person => ({
          ...person,
          tasks: person.tasks.map(task => 
            task.id === selectedTask.id ? editedTask : task
          )
        })));
      } else {
        // Henkilökohtainen tehtävä
        setPeople(people.map(person => 
          person.id === selectedPersonId 
            ? { 
                ...person, 
                tasks: person.tasks.map(task => 
                  task.id === selectedTask.id ? editedTask : task
                )
              }
            : person
        ));
      }
    }

    setShowTaskModal(false);
    setIsEditingTask(false);
    setSelectedTask(null);
    setEditedTask(null);
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

  // Hae henkilön viikkotehtävät
  const getPersonWeeklyTasks = (person: Person) => {
    return person.tasks.filter(task => 
      task.category === 'weekly' && 
      !task.completed &&
      (task.isShared || task.assignedTo === person.id)
    );
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

  // Renderöi tehtävä
  const renderTask = (task: Task, personId: string) => (
    <div
      key={task.id}
      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
        task.completed 
          ? 'bg-slate-50 border-slate-200 opacity-60' 
          : isTaskOverdue(task)
          ? 'bg-red-50 border-red-200'
          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
      } ${task.isShared ? 'border-l-4 border-l-orange-400' : ''}`}
      onClick={() => openTaskModal(task, personId)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleTask(personId, task.id);
        }}
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
        
        {task.dueDateType === 'within_week' && (
          <div className="text-xs text-green-600 mt-1 flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Viikon sisällä</span>
          </div>
        )}
        
        {task.isShared && task.completed && task.completedBy && (
          <div className="text-xs text-green-600 mt-1">
            ✓ Tehty: {task.completedBy}
          </div>
        )}
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteTask(personId, task.id);
        }}
        className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

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
          <Plus className="h-4 w-4" />
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`${person.bgColor} p-3 rounded-lg`}>
                    <User className={`h-6 w-6 ${person.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">{person.name}n tehtävät</h3>
                    <p className="text-sm text-slate-600">
                      {getFilteredTasks(person).filter(task => !task.completed).length} jäljellä
                      {viewFilter === 'today' && ' tänään'}
                      {viewFilter === 'scheduled' && ' ajoitettuna'}
                      {viewFilter === 'weekly' && ' viikolla'}
                    </p>
                  </div>
                </div>
                {person.id !== 'person1' && person.id !== 'person2' && (
                  <button
                    onClick={() => deletePerson(person.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <Trash2 className="h-5 w-5" />
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

              {/* Viikon sisällä hoidettavat tehtävät */}
              {(viewFilter === 'all' || viewFilter === 'weekly') && getPersonWeeklyTasks(person).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>Viikon sisällä hoidettavat ({getPersonWeeklyTasks(person).length})</span>
                  </h4>
                  <div className="space-y-3 bg-green-50 rounded-lg p-3 border border-green-200">
                    {getPersonWeeklyTasks(person).map(task => renderTask(task, person.id))}
                  </div>
                </div>
              )}

              {/* Muut tehtävät */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getFilteredTasks(person)
                  .filter(task => viewFilter === 'weekly' ? false : task.category !== 'weekly')
                  .map(task => renderTask(task, person.id))}
                
                {getFilteredTasks(person).filter(task => viewFilter === 'weekly' ? true : task.category !== 'weekly').length === 0 && (
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
              <div key={person.id} className="bg-white rounded-xl border border-slate-200/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`${person.bgColor} p-3 rounded-lg`}>
                      <User className={`h-6 w-6 ${person.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">{person.name}n tehtävät</h3>
                      <p className="text-sm text-slate-600">
                        {getFilteredTasks(person).filter(task => !task.completed).length} jäljellä
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePerson(person.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
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
                  
                  {/* Kompaktimmat asetukset lisähenkilöille */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <select
                        value={selectedPriority[person.id] || 'medium'}
                        onChange={(e) => setSelectedPriority({ ...selectedPriority, [person.id]: e.target.value as 'low' | 'medium' | 'high' })}
                        className="text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Matala</option>
                        <option value="medium">Keskitaso</option>
                        <option value="high">Korkea</option>
                      </select>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSharedTask[person.id] || false}
                          onChange={(e) => setIsSharedTask({ ...isSharedTask, [person.id]: e.target.checked })}
                          className="text-orange-600 focus:ring-orange-500 rounded"
                        />
                        <span className="text-sm text-slate-600">Jaettu</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={taskDueDateType[person.id] || 'none'}
                        onChange={(e) => setTaskDueDateType({ ...taskDueDateType, [person.id]: e.target.value as any })}
                        className="text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="none">Tänään</option>
                        <option value="specific">Tietty päivä</option>
                        <option value="within_week">Viikon sisällä</option>
                      </select>

                      {taskDueDateType[person.id] === 'specific' && (
                        <input
                          type="date"
                          value={taskDueDate[person.id] || ''}
                          onChange={(e) => setTaskDueDate({ ...taskDueDate, [person.id]: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Viikon sisällä hoidettavat tehtävät */}
                {(viewFilter === 'all' || viewFilter === 'weekly') && getPersonWeeklyTasks(person).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-green-600" />
                      <span>Viikon sisällä ({getPersonWeeklyTasks(person).length})</span>
                    </h4>
                    <div className="space-y-2 bg-green-50 rounded-lg p-2 border border-green-200">
                      {getPersonWeeklyTasks(person).map(task => renderTask(task, person.id))}
                    </div>
                  </div>
                )}

                {/* Muut tehtävät */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {getFilteredTasks(person)
                    .filter(task => viewFilter === 'weekly' ? false : task.category !== 'weekly')
                    .map(task => renderTask(task, person.id))}
                  
                  {getFilteredTasks(person).filter(task => viewFilter === 'weekly' ? true : task.category !== 'weekly').length === 0 && (
                    <div className="text-center py-6 text-slate-500">
                      <Users className="h-8 w-8 mx-auto mb-1 opacity-50" />
                      <p className="text-sm">Ei tehtäviä</p>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Nimi</label>
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Syötä henkilön nimi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Väri</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      onClick={() => setNewPersonColor(colorOption.color)}
                      className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                        newPersonColor === colorOption.color 
                          ? 'border-slate-800' 
                          : 'border-slate-300 hover:border-slate-400'
                      } ${colorOption.bgColor}`}
                    >
                      <User className={`h-5 w-5 ${colorOption.color} mx-auto`} />
                    </button>
                  ))}
                </div>
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

      {/* Tehtävän tarkastelu/muokkaus -modaali */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                {isEditingTask ? 'Muokkaa tehtävää' : 'Tehtävän tiedot'}
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {isEditingTask && editedTask ? (
              // Muokkaustila
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tehtävän nimi</label>
                  <input
                    type="text"
                    value={editedTask.text}
                    onChange={(e) => setEditedTask({ ...editedTask, text: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Prioriteetti</label>
                  <select
                    value={editedTask.priority}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Matala</option>
                    <option value="medium">Keskitaso</option>
                    <option value="high">Korkea</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tehtävän tyyppi</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="taskType"
                        checked={editedTask.isShared === true}
                        onChange={() => setEditedTask({ ...editedTask, isShared: true, assignedTo: undefined })}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-slate-700">Jaettu tehtävä (kumpi kerkeää)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="taskType"
                        checked={editedTask.isShared !== true}
                        onChange={() => setEditedTask({ ...editedTask, isShared: false, assignedTo: editedTask.assignedTo || selectedPersonId })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Henkilökohtainen tehtävä</span>
                    </label>
                  </div>
                </div>

                {!editedTask.isShared && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Suorittaja</label>
                    <select
                      value={editedTask.assignedTo || selectedPersonId}
                      onChange={(e) => setEditedTask({ ...editedTask, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {people.map(person => (
                        <option key={person.id} value={person.id}>{person.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ajankohta</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editDueDateType"
                        checked={!editedTask.dueDateType}
                        onChange={() => setEditedTask({ ...editedTask, dueDateType: undefined, dueDate: undefined, category: 'today' })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Tämän päivän tehtävä</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editDueDateType"
                        checked={editedTask.dueDateType === 'specific'}
                        onChange={() => setEditedTask({ ...editedTask, dueDateType: 'specific', category: 'scheduled' })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Tietty päivämäärä</span>
                    </label>
                    
                    {editedTask.dueDateType === 'specific' && (
                      <input
                        type="date"
                        value={editedTask.dueDate ? editedTask.dueDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditedTask({ ...editedTask, dueDate: new Date(e.target.value) })}
                        min={new Date().toISOString().split('T')[0]}
                        className="ml-6 px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editDueDateType"
                        checked={editedTask.dueDateType === 'within_week'}
                        onChange={() => setEditedTask({ ...editedTask, dueDateType: 'within_week', dueDate: undefined, category: 'weekly' })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Viikon sisällä hoidettava</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setIsEditingTask(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                  >
                    Peruuta
                  </button>
                  <button
                    onClick={saveTaskChanges}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Tallenna muutokset
                  </button>
                </div>
              </div>
            ) : (
              // Katselutila
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getPriorityColor(selectedTask.priority)}`} />
                  <h4 className="text-lg font-medium text-slate-800">{selectedTask.text}</h4>
                  {selectedTask.isShared && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-orange-600" />
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        Jaettu
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Prioriteetti:</span>
                    <span className="font-medium">{getPriorityLabel(selectedTask.priority)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Tila:</span>
                    <span className={`font-medium ${selectedTask.completed ? 'text-green-600' : 'text-slate-800'}`}>
                      {selectedTask.completed ? 'Valmis' : 'Kesken'}
                    </span>
                  </div>

                  {selectedTask.dueDate && (
                    <div className="flex items-center justify-between">
                      <span>Eräpäivä:</span>
                      <span className="font-medium">{formatDueDate(selectedTask.dueDate)}</span>
                    </div>
                  )}

                  {selectedTask.dueDateType === 'within_week' && (
                    <div className="flex items-center justify-between">
                      <span>Ajankohta:</span>
                      <span className="font-medium text-green-600">Viikon sisällä</span>
                    </div>
                  )}

                  {selectedTask.isShared ? (
                    <div className="flex items-center justify-between">
                      <span>Tyyppi:</span>
                      <span className="font-medium text-orange-600">Jaettu tehtävä</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>Suorittaja:</span>
                      <span className="font-medium">
                        {people.find(p => p.id === (selectedTask.assignedTo || selectedPersonId))?.name}
                      </span>
                    </div>
                  )}

                  {selectedTask.isShared && selectedTask.completed && selectedTask.completedBy && (
                    <div className="flex items-center justify-between">
                      <span>Suorittanut:</span>
                      <span className="font-medium text-green-600">{selectedTask.completedBy}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    onClick={() => toggleTask(selectedPersonId, selectedTask.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      selectedTask.completed
                        ? 'bg-slate-600 text-white hover:bg-slate-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    <span>{selectedTask.completed ? 'Merkitse keskeneräiseksi' : 'Merkitse valmiiksi'}</span>
                  </button>
                  
                  <button
                    onClick={startEditingTask}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Muokkaa</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoLists;