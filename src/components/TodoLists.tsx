import React, { useState } from 'react';
import { Plus, Check, X, User, Users, Clock, Calendar, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';

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
  description?: string;
  estimatedTime?: number; // minuutteina
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
        { id: 1, text: 'Ruokaostokset', completed: false, priority: 'high', category: 'today', description: 'Kauppalista on jääkaapissa', estimatedTime: 60 },
        { id: 2, text: 'Soita hammaslääkärille ajanvarausta varten', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 25), dueDateType: 'specific', category: 'scheduled', estimatedTime: 15 },
        { id: 3, text: 'Hae kuivapesu', completed: true, priority: 'low', category: 'today' },
        { id: 4, text: 'Valmista illallinen', completed: false, priority: 'high', category: 'today', description: 'Pasta Bolognese', estimatedTime: 45 },
        { id: 5, text: 'Vie roskat ulos', completed: false, priority: 'medium', isShared: true, category: 'today', estimatedTime: 5 },
        { id: 6, text: 'Käy apteekissa', completed: true, priority: 'medium', isShared: true, completedBy: 'Äiti', category: 'today', estimatedTime: 30 },
        { id: 7, text: 'Siivoa kylpyhuone', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly', estimatedTime: 90 },
        { id: 8, text: 'Varaa kesäloma', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 30), dueDateType: 'specific', category: 'scheduled', description: 'Tarkista hinnat eri sivustoilta' },
      ]
    },
    {
      id: 'person2',
      name: 'Isi',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      tasks: [
        { id: 9, text: 'Korjaa keittiön hana', completed: false, priority: 'high', category: 'today', description: 'Tarvitaan uusi tiiviste', estimatedTime: 120 },
        { id: 10, text: 'Varaa auton huolto', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 28), dueDateType: 'specific', category: 'scheduled', estimatedTime: 20 },
        { id: 11, text: 'Maksa sähkölasku', completed: true, priority: 'high', category: 'today' },
        { id: 12, text: 'Siivoa autotalli', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly', estimatedTime: 180 },
        { id: 5, text: 'Vie roskat ulos', completed: false, priority: 'medium', isShared: true, category: 'today', estimatedTime: 5 },
        { id: 6, text: 'Käy apteekissa', completed: true, priority: 'medium', isShared: true, completedBy: 'Äiti', category: 'today', estimatedTime: 30 },
        { id: 13, text: 'Osta uusi työkalupakki', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly', description: 'Vertaile hintoja netistä' },
      ]
    }
  ]);

  const [newTask, setNewTask] = useState<{ [key: string]: string }>({});
  const [selectedPriority, setSelectedPriority] = useState<{ [key: string]: 'low' | 'medium' | 'high' }>({});
  const [isSharedTask, setIsSharedTask] = useState<{ [key: string]: boolean }>({});
  const [taskDueDate, setTaskDueDate] = useState<{ [key: string]: string }>({});
  const [taskDueDateType, setTaskDueDateType] = useState<{ [key: string]: 'none' | 'specific' | 'within_week' }>({});
  const [taskDescription, setTaskDescription] = useState<{ [key: string]: string }>({});
  const [taskEstimatedTime, setTaskEstimatedTime] = useState<{ [key: string]: string }>({});
  
  const [viewMode, setViewMode] = useState<{ [key: string]: 'day' | 'week' }>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskPersonId, setSelectedTaskPersonId] = useState<string>('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingTaskPersonId, setEditingTaskPersonId] = useState<string>('');

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
      category,
      description: taskDescription[personId]?.trim() || undefined,
      estimatedTime: taskEstimatedTime[personId] ? parseInt(taskEstimatedTime[personId]) : undefined
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
    setTaskDescription({ ...taskDescription, [personId]: '' });
    setTaskEstimatedTime({ ...taskEstimatedTime, [personId]: '' });
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
    setSelectedTaskPersonId(personId);
    setShowTaskModal(true);
  };

  const openEditModal = (task: Task, personId: string) => {
    setEditingTask({ ...task });
    setEditingTaskPersonId(personId);
    setShowEditModal(true);
    setShowTaskModal(false);
  };

  const saveEditedTask = () => {
    if (!editingTask || !editingTask.text.trim()) return;

    const oldTask = people.find(p => p.id === editingTaskPersonId)?.tasks.find(t => t.id === editingTask.id);
    
    if (oldTask?.isShared) {
      // Jos tehtävä on jaettu, päivitä se molemmille
      setPeople(people.map(person => ({
        ...person,
        tasks: person.tasks.map(task => 
          task.id === editingTask.id ? editingTask : task
        )
      })));
    } else {
      // Jos henkilö vaihtui, poista tehtävä vanhalta henkilöltä ja lisää uudelle
      if (editingTaskPersonId !== selectedTaskPersonId) {
        // Poista vanhalta henkilöltä
        setPeople(prevPeople => {
          const updatedPeople = prevPeople.map(person => 
            person.id === selectedTaskPersonId 
              ? { ...person, tasks: person.tasks.filter(task => task.id !== editingTask.id) }
              : person
          );
          
          // Lisää uudelle henkilölle
          return updatedPeople.map(person => 
            person.id === editingTaskPersonId 
              ? { ...person, tasks: [...person.tasks, editingTask] }
              : person
          );
        });
      } else {
        // Sama henkilö, päivitä vain tehtävä
        setPeople(people.map(person => 
          person.id === editingTaskPersonId 
            ? { 
                ...person, 
                tasks: person.tasks.map(task => 
                  task.id === editingTask.id ? editingTask : task
                )
              }
            : person
        ));
      }
    }

    setShowEditModal(false);
    setEditingTask(null);
    setEditingTaskPersonId('');
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

  const formatTime = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours} h ${mins} min`;
    } else if (hours > 0) {
      return `${hours} h`;
    } else {
      return `${mins} min`;
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

  // Viikkonäkymän päivät
  const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Aloita maanantaista
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getTasksForDay = (person: Person, date: Date) => {
    return person.tasks.filter(task => {
      if (task.category === 'today') {
        return isTaskDueToday(task) || (!task.dueDate && date.toDateString() === new Date().toDateString());
      } else if (task.category === 'scheduled') {
        return task.dueDate && isSameDay(task.dueDate, date);
      } else if (task.category === 'weekly') {
        return true; // Viikkotehtävät näkyvät kaikissa päivissä
      }
      return false;
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const renderDayView = (person: Person) => {
    const todayTasks = person.tasks.filter(task => task.category === 'today');
    const weeklyTasks = person.tasks.filter(task => task.category === 'weekly' && !task.completed);

    return (
      <div className="space-y-6">
        {/* Tämän päivän tehtävät */}
        <div>
          <h4 className="text-md font-medium text-slate-800 mb-3">Tämän päivän tehtävät</h4>
          <div className="space-y-3">
            {todayTasks.map(task => (
              <div
                key={task.id}
                onClick={() => openTaskModal(task, person.id)}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                  task.completed 
                    ? 'bg-slate-50 border-slate-200 opacity-60' 
                    : isTaskOverdue(task)
                    ? 'bg-red-50 border-red-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                } ${task.isShared ? 'border-l-4 border-l-orange-400' : ''}`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(person.id, task.id);
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
                          Jaettu
                        </span>
                      </div>
                    )}
                    {task.estimatedTime && (
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {formatTime(task.estimatedTime)}
                      </span>
                    )}
                  </div>
                  
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
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(person.id, task.id);
                  }}
                  className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {todayTasks.length === 0 && (
              <div className="text-center py-4 text-slate-500">
                <p className="text-sm">Ei tehtäviä tänään</p>
              </div>
            )}
          </div>
        </div>

        {/* Viikon sisällä hoidettavat */}
        {weeklyTasks.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-slate-800 mb-3">Viikon sisällä hoidettavat</h4>
            <div className="space-y-3">
              {weeklyTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => openTaskModal(task, person.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    task.completed 
                      ? 'bg-slate-50 border-slate-200 opacity-60' 
                      : 'bg-green-50 border-green-200 hover:bg-green-100'
                  } ${task.isShared ? 'border-l-4 border-l-orange-400' : ''}`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(person.id, task.id);
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
                            Jaettu
                          </span>
                        </div>
                      )}
                      {task.estimatedTime && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {formatTime(task.estimatedTime)}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Viikon sisällä</span>
                    </div>
                    
                    {task.isShared && task.completed && task.completedBy && (
                      <div className="text-xs text-green-600 mt-1">
                        ✓ Tehty: {task.completedBy}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(person.id, task.id);
                    }}
                    className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = (person: Person) => {
    const weekDays = getWeekDays();
    const dayNames = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

    return (
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDay(person, day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div key={index} className={`min-h-32 p-2 rounded-lg border ${
                isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
              }`}>
                <div className={`text-xs font-medium mb-2 text-center ${
                  isToday ? 'text-blue-700' : 'text-slate-700'
                }`}>
                  <div>{dayNames[index]}</div>
                  <div className={`text-lg ${isToday ? 'font-bold' : ''}`}>
                    {day.getDate()}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      onClick={() => openTaskModal(task, person.id)}
                      className={`p-1 rounded text-xs cursor-pointer transition-colors duration-200 ${
                        task.completed 
                          ? 'bg-slate-200 text-slate-500 line-through' 
                          : task.category === 'weekly'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : isTaskOverdue(task)
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      } ${task.isShared ? 'border-l-2 border-orange-400' : ''}`}
                    >
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                        <span className="truncate">{task.text}</span>
                      </div>
                      {task.estimatedTime && (
                        <div className="text-xs text-slate-500 mt-1">
                          {formatTime(task.estimatedTime)}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{dayTasks.length - 3} lisää
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
            const stats = getTaskStats(person);
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
                    {person.tasks.filter(task => !task.completed).length} jäljellä
                  </p>
                </div>
              </div>
              
              {/* Näkymävalitsin */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode({ ...viewMode, [person.id]: 'day' })}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    (viewMode[person.id] || 'day') === 'day'
                      ? 'bg-white text-slate-800 shadow'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Päivä
                </button>
                <button
                  onClick={() => setViewMode({ ...viewMode, [person.id]: 'week' })}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode[person.id] === 'week'
                      ? 'bg-white text-slate-800 shadow'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Viikko
                </button>
              </div>
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

                {/* Kuvaus */}
                <div>
                  <input
                    type="text"
                    placeholder="Kuvaus (valinnainen)..."
                    value={taskDescription[person.id] || ''}
                    onChange={(e) => setTaskDescription({ ...taskDescription, [person.id]: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Arvioitu aika */}
                <div>
                  <input
                    type="number"
                    placeholder="Arvioitu aika (min, valinnainen)..."
                    value={taskEstimatedTime[person.id] || ''}
                    onChange={(e) => setTaskEstimatedTime({ ...taskEstimatedTime, [person.id]: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    min="1"
                  />
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
                    <span className="text-sm font-medium">Jaettu tehtävä</span>
                  </div>
                  <p className="text-xs text-orange-700 mt-1">
                    Tämä tehtävä näkyy molempien listoissa. Ensimmäinen joka merkitsee sen valmiiksi, saa siitä kunnian!
                  </p>
                </div>
              )}
            </div>

            {/* Tehtävänäkymä */}
            <div className="max-h-96 overflow-y-auto">
              {(viewMode[person.id] || 'day') === 'day' ? renderDayView(person) : renderWeekView(person)}
            </div>
          </div>
        ))}
      </div>

      {/* Tehtävän yksityiskohdat -modaali */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Tehtävän tiedot</h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Myöhässä varoitus */}
              {isTaskOverdue(selectedTask) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2 text-red-800">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Tehtävä on myöhässä!</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Otsikko ja tila */}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <button
                      onClick={() => toggleTask(selectedTaskPersonId, selectedTask.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                        selectedTask.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-slate-300 hover:border-green-500'
                      }`}
                    >
                      {selectedTask.completed && <Check className="h-4 w-4" />}
                    </button>
                    <h4 className={`text-lg font-medium ${selectedTask.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {selectedTask.text}
                    </h4>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedTask.priority)}`} />
                    <span className="text-sm text-slate-600">
                      Prioriteetti: {getPriorityLabel(selectedTask.priority)}
                    </span>
                  </div>
                  
                  {selectedTask.isShared && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-600">Jaettu tehtävä</span>
                    </div>
                  )}
                </div>

                {/* Kuvaus */}
                {selectedTask.description && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-1">Kuvaus</h5>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                {/* Arvioitu aika */}
                {selectedTask.estimatedTime && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-1">Arvioitu aika</h5>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">
                        {formatTime(selectedTask.estimatedTime)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Päivämäärä */}
                {selectedTask.dueDate && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-1">Eräpäivä</h5>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className={`text-sm ${
                        isTaskOverdue(selectedTask) ? 'text-red-600 font-medium' : 'text-slate-600'
                      }`}>
                        {formatDueDate(selectedTask.dueDate)}
                        {isTaskOverdue(selectedTask) && ' (Myöhässä)'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Kategoria */}
                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-1">Kategoria</h5>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    selectedTask.category === 'today' ? 'bg-blue-100 text-blue-800' :
                    selectedTask.category === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedTask.category === 'today' ? 'Tämän päivän tehtävä' :
                     selectedTask.category === 'scheduled' ? 'Ajoitettu tehtävä' :
                     'Viikkotehtävä'}
                  </span>
                </div>

                {/* Jaetun tehtävän tila */}
                {selectedTask.isShared && selectedTask.completed && selectedTask.completedBy && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-1">Suorittaja</h5>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">
                        Tehty: {selectedTask.completedBy}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => openEditModal(selectedTask, selectedTaskPersonId)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Muokkaa</span>
                </button>
                <button
                  onClick={() => {
                    deleteTask(selectedTaskPersonId, selectedTask.id);
                    setShowTaskModal(false);
                  }}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Poista</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Muokkaa tehtävää -modaali */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Muokkaa tehtävää</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Tehtävän nimi */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tehtävän nimi *
                  </label>
                  <input
                    type="text"
                    value={editingTask.text}
                    onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Kuvaus */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kuvaus
                  </label>
                  <textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Arvioitu aika */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Arvioitu aika (minuuttia)
                  </label>
                  <input
                    type="number"
                    value={editingTask.estimatedTime || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, estimatedTime: e.target.value ? parseInt(e.target.value) : undefined })}
                    min="1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Henkilö (vain jos ei ole jaettu tehtävä) */}
                {!editingTask.isShared && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Vastuuhenkilö
                    </label>
                    <select
                      value={editingTaskPersonId}
                      onChange={(e) => setEditingTaskPersonId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {people.map(person => (
                        <option key={person.id} value={person.id}>
                          {person.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Prioriteetti */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prioriteetti
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Matala</option>
                    <option value="medium">Keskitaso</option>
                    <option value="high">Korkea</option>
                  </select>
                </div>

                {/* Ajankohta */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ajankohta
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editDueDateType"
                        checked={!editingTask.dueDateType}
                        onChange={() => setEditingTask({ 
                          ...editingTask, 
                          dueDateType: undefined, 
                          dueDate: undefined, 
                          category: 'today' 
                        })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Tämän päivän tehtävä</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editDueDateType"
                        checked={editingTask.dueDateType === 'specific'}
                        onChange={() => setEditingTask({ 
                          ...editingTask, 
                          dueDateType: 'specific', 
                          category: 'scheduled' 
                        })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Tietty päivämäärä</span>
                    </label>
                    
                    {editingTask.dueDateType === 'specific' && (
                      <input
                        type="date"
                        value={editingTask.dueDate ? editingTask.dueDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditingTask({ 
                          ...editingTask, 
                          dueDate: e.target.value ? new Date(e.target.value) : undefined 
                        })}
                        min={new Date().toISOString().split('T')[0]}
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
                          dueDateType: 'within_week', 
                          dueDate: undefined, 
                          category: 'weekly' 
                        })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Viikon sisällä hoidettava</span>
                    </label>
                  </div>
                </div>

                {/* Jaettu tehtävä -tiedote */}
                {editingTask.isShared && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-orange-800">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Jaettu tehtävä</span>
                    </div>
                    <p className="text-xs text-orange-700 mt-1">
                      Tämä on jaettu tehtävä. Muutokset vaikuttavat molempien henkilöiden listoihin.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                >
                  Peruuta
                </button>
                <button
                  onClick={saveEditedTask}
                  disabled={!editingTask.text.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    editingTask.text.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Tallenna muutokset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoLists;