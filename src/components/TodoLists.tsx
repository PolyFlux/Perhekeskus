import React, { useState } from 'react';
import { Plus, Check, X, User, Users, Clock, Calendar, ChevronDown, ChevronUp, Edit2, Save } from 'lucide-react';

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

  // Tehtävän tarkastelu/muokkaus
  const [selectedTask, setSelectedTask] = useState<{ task: Task; personId: string } | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);

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

  const openTaskModal = (task: Task, personId: string) => {
    setSelectedTask({ task, personId });
    setEditedTask({ ...task });
    setShowTaskModal(true);
    setIsEditingTask(false);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    setEditedTask(null);
    setIsEditingTask(false);
  };

  const startEditingTask = () => {
    setIsEditingTask(true);
  };

  const cancelEditingTask = () => {
    if (selectedTask) {
      setEditedTask({ ...selectedTask.task });
    }
    setIsEditingTask(false);
  };

  const saveTaskChanges = () => {
    if (!editedTask || !selectedTask) return;

    // Päivitä tehtävä
    if (editedTask.isShared) {
      // Jaettu tehtävä - päivitä molemmille
      setPeople(people.map(person => ({
        ...person,
        tasks: person.tasks.map(task => 
          task.id === editedTask.id ? { ...editedTask } : task
        )
      })));
    } else {
      // Henkilökohtainen tehtävä
      setPeople(people.map(person => 
        person.id === selectedTask.personId 
          ? { 
              ...person, 
              tasks: person.tasks.map(task => 
                task.id === editedTask.id ? { ...editedTask } : task
              )
            }
          : person
      ));
    }

    setIsEditingTask(false);
    setSelectedTask({ ...selectedTask, task: editedTask });
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

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'today': return 'Tämän päivän tehtävä';
      case 'scheduled': return 'Ajoitettu tehtävä';
      case 'weekly': return 'Viikkotehtävä';
      default: return 'Tämän päivän tehtävä';
    }
  };

  const getTaskStats = (person: Person, viewType: 'today' | 'week') => {
    let filteredTasks;
    if (viewType === 'today') {
      filteredTasks = person.tasks.filter(task => task.category === 'today');
    } else {
      // Viikkonäkymä sisältää kaikki tehtävät
      filteredTasks = person.tasks;
    }
    
    const completed = filteredTasks.filter(task => task.completed).length;
    const total = filteredTasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  // Suodata tehtävät henkilön näkymän mukaan (ei sisällä viikkotehtäviä)
  const getFilteredTasks = (person: Person, viewType: 'today' | 'week') => {
    if (viewType === 'today') {
      return person.tasks.filter(task => task.category === 'today');
    } else {
      // Viikkonäkymä näyttää tänään ja ajoitetut tehtävät, mutta ei viikkotehtäviä
      return person.tasks.filter(task => task.category === 'today' || task.category === 'scheduled');
    }
  };

  // Hae viikkotehtävät erikseen
  const getWeeklyTasks = (person: Person) => {
    return person.tasks.filter(task => task.category === 'weekly');
  };

  // Hae kaikki viikkotehtävät (poista duplikaatit jaetuista)
  const getAllWeeklyTasks = () => {
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

  const setPersonView = (personId: string, view: 'today' | 'week') => {
    setPersonViews({ ...personViews, [personId]: view });
  };

  // Hae viikon päivät
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

  // Hae tehtävät tietylle päivälle (ei sisällä viikkotehtäviä)
  const getTasksForDay = (person: Person, date: Date) => {
    return person.tasks.filter(task => {
      if (task.category === 'today') {
        // Tämän päivän tehtävät näkyvät vain tänään
        const today = new Date();
        return date.toDateString() === today.toDateString();
      } else if (task.category === 'scheduled' && task.dueDate) {
        // Ajoitetut tehtävät näkyvät määrättynä päivänä
        return date.toDateString() === task.dueDate.toDateString();
      }
      // Viikkotehtävät eivät näy kalenterissa
      return false;
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const renderWeekCalendar = (person: Person) => {
    const weekDays = getWeekDays();
    const today = new Date();

    return (
      <div className="bg-white rounded-lg border border-slate-200/50 overflow-hidden">
        {/* Viikon otsikko */}
        <div className="grid grid-cols-7 bg-slate-50">
          {weekDays.map((day, index) => (
            <div key={index} className="p-1 text-center border-r border-slate-200 last:border-r-0">
              <div className="text-xs font-medium text-slate-600">{dayNames[index]}</div>
              <div className={`text-sm font-semibold mt-1 ${
                isSameDay(day, today) 
                  ? 'bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto text-xs' 
                  : 'text-slate-800'
              }`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Viikon tehtävät */}
        <div className="grid grid-cols-7 min-h-24">
          {weekDays.map((day, dayIndex) => {
            const dayTasks = getTasksForDay(person, day);
            const isToday = isSameDay(day, today);

            return (
              <div 
                key={dayIndex} 
                className={`p-1 border-r border-slate-200 last:border-r-0 min-h-24 ${
                  isToday ? 'bg-blue-50' : 'hover:bg-slate-50'
                } transition-colors duration-200`}
              >
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      onClick={() => openTaskModal(task, person.id)}
                      className={`text-xs p-1 rounded border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                        task.completed 
                          ? 'bg-slate-100 border-slate-200 opacity-60 line-through' 
                          : task.category === 'today'
                          ? 'bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200'
                          : task.category === 'scheduled'
                          ? isTaskOverdue(task) 
                            ? 'bg-red-100 border-red-200 text-red-800 hover:bg-red-200'
                            : 'bg-purple-100 border-purple-200 text-purple-800 hover:bg-purple-200'
                          : 'bg-green-100 border-green-200 text-green-800 hover:bg-green-200'
                      } ${task.isShared ? 'border-l-2 border-l-orange-400' : ''}`}
                      title={`Klikkaa avataksesi: ${task.text}`}
                    >
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(person.id, task.id);
                          }}
                          className={`flex-shrink-0 w-2 h-2 rounded border flex items-center justify-center ${
                            task.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-slate-400 hover:border-green-500'
                          }`}
                        >
                          {task.completed && <Check className="h-1 w-1" />}
                        </button>
                        <div className={`w-1 h-1 rounded-full ${getPriorityColor(task.priority)}`} />
                        <span className="truncate flex-1 text-xs">{task.text}</span>
                        {task.isShared && (
                          <Users className="h-2 w-2 text-orange-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{dayTasks.length - 3}
                    </div>
                  )}
                  
                  {dayTasks.length === 0 && (
                    <div className="text-xs text-slate-400 text-center py-1">
                      Ei tehtäviä
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

  const renderTaskItem = (task: Task, personId: string) => (
    <div
      key={task.id}
      onClick={() => openTaskModal(task, personId)}
      className={`flex items-center space-x-2 p-2 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm ${
        task.completed 
          ? 'bg-slate-50 border-slate-200 opacity-60' 
          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
      } ${task.isShared ? 'border-l-4 border-l-orange-400' : ''}`}
      title={`Klikkaa avataksesi: ${task.text}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleTask(personId, task.id);
        }}
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
        <div className="flex items-center space-x-1">
          <span className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
            {task.text}
          </span>
          {task.isShared && (
            <Users className="h-3 w-3 text-orange-600" />
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
          <div className="text-xs text-green-600">
            ✓ {task.completedBy}
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
        <X className="h-3 w-3" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Otsikko */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Perheen tehtävälistat</h2>
        <p className="text-slate-600">Hallinnoi päivittäisiä tehtäviä ja suunnittele viikkoa</p>
      </div>

      {/* Viikon aikana hoidettavat tehtävät - Oma osio */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
          <Clock className="h-5 w-5 text-green-600" />
          <span>Viikon aikana hoidettavat ({getAllWeeklyTasks().length})</span>
        </h3>
        
        <div className="space-y-3">
          {getAllWeeklyTasks().map((task) => (
            <div
              key={`${task.personId}-${task.id}`}
              onClick={() => openTaskModal(task, task.personId)}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                task.completed 
                  ? 'bg-slate-50 border-slate-200 opacity-60' 
                  : 'bg-green-50 border-green-200 hover:bg-green-100'
              } ${task.isShared ? 'border-l-4 border-l-orange-400' : ''}`}
              title={`Klikkaa avataksesi: ${task.text}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTask(task.personId, task.id);
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
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <span>{task.personName}</span>
                  <span>•</span>
                  <span className="text-green-600">Viikon sisällä</span>
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
                  deleteTask(task.personId, task.id);
                }}
                className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {getAllWeeklyTasks().length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Ei viikkotehtäviä</p>
            </div>
          )}
        </div>
      </div>

      {/* Yksittäiset tehtävälistat - Aina rinnakkain */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {people.map(person => {
          const currentView = personViews[person.id] || 'today';
          const personStats = getTaskStats(person, currentView);
          
          return (
            <div key={person.id} className="bg-white rounded-xl border border-slate-200/50 p-4">
              {/* Henkilön otsikko ja näkymävalinnat */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`${person.bgColor} p-2 rounded-lg`}>
                    <User className={`h-4 w-4 ${person.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{person.name}</h3>
                    <p className="text-xs text-slate-600">
                      {getFilteredTasks(person, currentView).filter(task => !task.completed).length} jäljellä
                      {currentView === 'today' ? ' tänään' : ' viikolla'}
                    </p>
                  </div>
                </div>
                
                {/* Näkymävalinnat */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setPersonView(person.id, 'today')}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                      currentView === 'today' 
                        ? 'bg-white text-slate-800 shadow' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Tänään
                  </button>
                  <button
                    onClick={() => setPersonView(person.id, 'week')}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                      currentView === 'week' 
                        ? 'bg-white text-slate-800 shadow' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Viikko
                  </button>
                </div>
              </div>

              {/* Henkilön edistyminen */}
              <div className={`${person.bgColor} rounded-lg p-3 border border-slate-200/50 mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {currentView === 'today' ? 'Tänään' : 'Viikko'}
                  </span>
                  <span className="text-xs text-slate-600">
                    {personStats.completed}/{personStats.total}
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-2 mb-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      person.color === 'text-blue-600' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}
                    style={{ width: `${personStats.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-600">
                  {personStats.percentage}% valmis
                </div>
              </div>

              {/* Tehtävälista tai kalenterinäkymä */}
              <div className="mb-4">
                {currentView === 'week' ? (
                  // Kalenterimallinen viikkonäkymä
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Viikkokalenteri</span>
                    </h4>
                    {renderWeekCalendar(person)}
                  </div>
                ) : (
                  // Tämän päivän listanäkymä
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getFilteredTasks(person, currentView).map(task => 
                      renderTaskItem(task, person.id)
                    )}
                    
                    {getFilteredTasks(person, currentView).length === 0 && (
                      <div className="text-center py-6 text-slate-500">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Ei tehtäviä tänään</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Lisää uusi tehtävä - Kompakti versio */}
              <div className="border-t border-slate-200 pt-4">
                <div className="space-y-3">
                  <div className="flex space-x-2">
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
                      className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors duration-200 flex items-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  
                  {/* Kompaktit asetukset */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <select
                      value={selectedPriority[person.id] || 'medium'}
                      onChange={(e) => setSelectedPriority({ ...selectedPriority, [person.id]: e.target.value as 'low' | 'medium' | 'high' })}
                      className="text-xs border border-slate-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="low">Matala</option>
                      <option value="medium">Keskitaso</option>
                      <option value="high">Korkea</option>
                    </select>

                    <select
                      value={taskDueDateType[person.id] || 'none'}
                      onChange={(e) => setTaskDueDateType({ ...taskDueDateType, [person.id]: e.target.value as any })}
                      className="text-xs border border-slate-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="none">Tänään</option>
                      <option value="specific">Tietty päivä</option>
                      <option value="within_week">Viikon sisällä</option>
                    </select>
                  </div>

                  {taskDueDateType[person.id] === 'specific' && (
                    <input
                      type="date"
                      value={taskDueDate[person.id] || ''}
                      onChange={(e) => setTaskDueDate({ ...taskDueDate, [person.id]: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSharedTask[person.id] || false}
                      onChange={(e) => setIsSharedTask({ ...isSharedTask, [person.id]: e.target.checked })}
                      className="text-orange-600 focus:ring-orange-500 rounded"
                    />
                    <span className="text-xs text-slate-600 flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>Jaettu tehtävä</span>
                    </span>
                  </label>

                  {/* Selitys jaetulle tehtävälle */}
                  {isSharedTask[person.id] && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-2">
                      <div className="flex items-center space-x-1 text-orange-800">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs font-medium">Kumpi kerkeää -tehtävä</span>
                      </div>
                      <p className="text-xs text-orange-700 mt-1">
                        Näkyy molempien listoissa. Ensimmäinen merkitsijä saa kunnian!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tehtävän tarkastelu/muokkaus -modaali */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col">
            {/* Kiinteä otsikko */}
            <div className="p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">
                  {isEditingTask ? 'Muokkaa tehtävää' : 'Tehtävän tiedot'}
                </h3>
                <button
                  onClick={closeTaskModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Vieritettävä sisältö */}
            <div className="flex-1 overflow-y-auto p-6">
              {editedTask && (
                <div className="space-y-4">
                  {/* Tehtävän nimi */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tehtävän nimi
                    </label>
                    {isEditingTask ? (
                      <input
                        type="text"
                        value={editedTask.text}
                        onChange={(e) => setEditedTask({ ...editedTask, text: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{editedTask.text}</p>
                    )}
                  </div>

                  {/* Prioriteetti */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Prioriteetti
                    </label>
                    {isEditingTask ? (
                      <select
                        value={editedTask.priority}
                        onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Matala</option>
                        <option value="medium">Keskitaso</option>
                        <option value="high">Korkea</option>
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(editedTask.priority)}`} />
                        <span className="text-slate-800">{getPriorityLabel(editedTask.priority)}</span>
                      </div>
                    )}
                  </div>

                  {/* Kategoria/Ajankohta */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ajankohta
                    </label>
                    {isEditingTask ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="taskCategory"
                              checked={editedTask.category === 'today'}
                              onChange={() => setEditedTask({ 
                                ...editedTask, 
                                category: 'today', 
                                dueDate: undefined, 
                                dueDateType: undefined 
                              })}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">Tämän päivän tehtävä</span>
                          </label>
                          
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="taskCategory"
                              checked={editedTask.category === 'scheduled'}
                              onChange={() => setEditedTask({ 
                                ...editedTask, 
                                category: 'scheduled', 
                                dueDateType: 'specific' 
                              })}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">Tietty päivämäärä</span>
                          </label>
                          
                          {editedTask.category === 'scheduled' && (
                            <input
                              type="date"
                              value={editedTask.dueDate ? editedTask.dueDate.toISOString().split('T')[0] : ''}
                              onChange={(e) => setEditedTask({ 
                                ...editedTask, 
                                dueDate: e.target.value ? new Date(e.target.value) : undefined 
                              })}
                              min={new Date().toISOString().split('T')[0]}
                              className="ml-6 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                          
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="taskCategory"
                              checked={editedTask.category === 'weekly'}
                              onChange={() => setEditedTask({ 
                                ...editedTask, 
                                category: 'weekly', 
                                dueDate: undefined, 
                                dueDateType: 'within_week' 
                              })}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">Viikon sisällä hoidettava</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-slate-800">{getCategoryLabel(editedTask.category)}</p>
                        {editedTask.dueDate && (
                          <p className="text-sm text-slate-600 mt-1">
                            Eräpäivä: {formatDueDate(editedTask.dueDate)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Jaettu tehtävä */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tehtävän tyyppi
                    </label>
                    {isEditingTask ? (
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editedTask.isShared || false}
                          onChange={(e) => setEditedTask({ ...editedTask, isShared: e.target.checked })}
                          className="text-orange-600 focus:ring-orange-500 rounded"
                        />
                        <span className="text-sm text-slate-700 flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>Jaettu tehtävä (kumpi kerkeää)</span>
                        </span>
                      </label>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        {editedTask.isShared ? (
                          <div className="flex items-center space-x-2 text-orange-600">
                            <Users className="h-4 w-4" />
                            <span>Jaettu tehtävä (kumpi kerkeää)</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-slate-600">
                            <User className="h-4 w-4" />
                            <span>Henkilökohtainen tehtävä</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Suorittaja */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Suorittaja
                    </label>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-800">
                        {editedTask.isShared 
                          ? 'Kumpi tahansa (jaettu tehtävä)' 
                          : people.find(p => p.id === selectedTask.personId)?.name || 'Tuntematon'
                        }
                      </p>
                      {editedTask.completed && editedTask.completedBy && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ Suorittanut: {editedTask.completedBy}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tila */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tila
                    </label>
                    <div className={`p-3 rounded-lg ${
                      editedTask.completed 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          editedTask.completed ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <span className={`font-medium ${
                          editedTask.completed ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                          {editedTask.completed ? 'Valmis' : 'Kesken'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Kiinteät painikkeet */}
            <div className="p-6 border-t border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {!isEditingTask ? (
                    <>
                      <button
                        onClick={() => toggleTask(selectedTask.personId, selectedTask.task.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                          selectedTask.task.completed
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <Check className="h-4 w-4" />
                        <span>{selectedTask.task.completed ? 'Merkitse keskeneräiseksi' : 'Merkitse valmiiksi'}</span>
                      </button>
                      <button
                        onClick={startEditingTask}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Muokkaa</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={saveTaskChanges}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <Save className="h-4 w-4" />
                        <span>Tallenna</span>
                      </button>
                      <button
                        onClick={cancelEditingTask}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                      >
                        Peruuta
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    deleteTask(selectedTask.personId, selectedTask.task.id);
                    closeTaskModal();
                  }}
                  className="text-red-600 hover:text-red-700 px-4 py-2 transition-colors duration-200"
                >
                  Poista tehtävä
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