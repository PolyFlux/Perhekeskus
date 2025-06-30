import React, { useState } from 'react';
import { Plus, Check, X, User, Users, Clock, Calendar, ChevronDown, ChevronUp, Edit2, Save, XCircle, UserPlus, Trash2 } from 'lucide-react';

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
        { id: 1, text: 'Ruokaostokset', completed: false, priority: 'high', category: 'today', estimatedTime: 60 },
        { id: 2, text: 'Soita hammaslääkärille ajanvarausta varten', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 25), dueDateType: 'specific', category: 'scheduled', description: 'Varaa aika seuraavalle kuukaudelle' },
        { id: 3, text: 'Hae kuivapesu', completed: true, priority: 'low', category: 'today', estimatedTime: 30 },
        { id: 4, text: 'Valmista illallinen', completed: false, priority: 'high', category: 'today', estimatedTime: 45 },
        { id: 5, text: 'Vie roskat ulos', completed: false, priority: 'medium', isShared: true, category: 'today', estimatedTime: 10 },
        { id: 6, text: 'Käy apteekissa', completed: true, priority: 'medium', isShared: true, completedBy: 'Äiti', category: 'today', estimatedTime: 20 },
        { id: 7, text: 'Siivoa kylpyhuone', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly', estimatedTime: 90 },
        { id: 8, text: 'Varaa kesäloma', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 30), dueDateType: 'specific', category: 'scheduled', description: 'Tarkista hinnat ja saatavuus' },
      ]
    },
    {
      id: 'person2',
      name: 'Isi',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      tasks: [
        { id: 9, text: 'Korjaa keittiön hana', completed: false, priority: 'high', category: 'today', estimatedTime: 120 },
        { id: 10, text: 'Varaa auton huolto', completed: false, priority: 'medium', dueDate: new Date(2025, 0, 28), dueDateType: 'specific', category: 'scheduled', description: 'Öljynvaihto ja katsastus' },
        { id: 11, text: 'Maksa sähkölasku', completed: true, priority: 'high', category: 'today', estimatedTime: 15 },
        { id: 12, text: 'Siivoa autotalli', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly', estimatedTime: 180 },
        { id: 5, text: 'Vie roskat ulos', completed: false, priority: 'medium', isShared: true, category: 'today', estimatedTime: 10 },
        { id: 6, text: 'Käy apteekissa', completed: true, priority: 'medium', isShared: true, completedBy: 'Äiti', category: 'today', estimatedTime: 20 },
        { id: 13, text: 'Osta uusi työkalupakki', completed: false, priority: 'low', dueDateType: 'within_week', category: 'weekly', estimatedTime: 60 },
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
  const [editingTask, setEditingTask] = useState<{ personId: string; taskId: number } | null>(null);
  const [editForm, setEditForm] = useState<Task | null>(null);
  const [editAssignedPerson, setEditAssignedPerson] = useState<string>('');

  // Henkilöiden hallinta
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonColor, setNewPersonColor] = useState('text-green-600');
  const [newPersonBgColor, setNewPersonBgColor] = useState('bg-green-50');

  // Värivaihtoehdot uusille henkilöille
  const colorOptions = [
    { color: 'text-green-600', bgColor: 'bg-green-50', label: 'Vihreä' },
    { color: 'text-red-600', bgColor: 'bg-red-50', label: 'Punainen' },
    { color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Keltainen' },
    { color: 'text-indigo-600', bgColor: 'bg-indigo-50', label: 'Indigo' },
    { color: 'text-pink-600', bgColor: 'bg-pink-50', label: 'Pinkki' },
    { color: 'text-teal-600', bgColor: 'bg-teal-50', label: 'Turkoosi' },
    { color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Oranssi' },
    { color: 'text-cyan-600', bgColor: 'bg-cyan-50', label: 'Syaani' },
    { color: 'text-lime-600', bgColor: 'bg-lime-50', label: 'Lime' },
    { color: 'text-rose-600', bgColor: 'bg-rose-50', label: 'Ruusu' },
  ];

  const addPerson = () => {
    if (!newPersonName.trim()) return;

    const newPerson: Person = {
      id: `person_${Date.now()}`,
      name: newPersonName.trim(),
      color: newPersonColor,
      bgColor: newPersonBgColor,
      tasks: []
    };

    setPeople([...people, newPerson]);
    setNewPersonName('');
    setNewPersonColor('text-green-600');
    setNewPersonBgColor('bg-green-50');
    setShowAddPersonModal(false);
  };

  const deletePerson = (personId: string) => {
    // Estä ensimmäisten kahden henkilön poistaminen
    if (personId === 'person1' || personId === 'person2') {
      alert('Äitiä ja isiä ei voi poistaa.');
      return;
    }

    // Tarkista onko henkilöllä jaettuja tehtäviä
    const person = people.find(p => p.id === personId);
    const hasSharedTasks = person?.tasks.some(task => task.isShared);

    if (hasSharedTasks) {
      if (!confirm('Tällä henkilöllä on jaettuja tehtäviä. Haluatko varmasti poistaa henkilön? Jaetut tehtävät poistetaan kaikilta.')) {
        return;
      }
      
      // Poista jaetut tehtävät kaikilta
      const sharedTaskIds = person?.tasks.filter(task => task.isShared).map(task => task.id) || [];
      setPeople(people.filter(p => p.id !== personId).map(p => ({
        ...p,
        tasks: p.tasks.filter(task => !sharedTaskIds.includes(task.id))
      })));
    } else {
      setPeople(people.filter(p => p.id !== personId));
    }
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
      dueDate,
      dueDateType: dueDateType === 'none' ? undefined : dueDateType,
      category,
      description: taskDescription[personId]?.trim() || undefined,
      estimatedTime: taskEstimatedTime[personId] ? parseInt(taskEstimatedTime[personId]) : undefined
    };

    if (isSharedTask[personId]) {
      // Lisää jaettu tehtävä kaikille
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
      // Jaettu tehtävä - merkitse valmiiksi kaikille ja tallenna kuka teki
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
      // Poista jaettu tehtävä kaikilta
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

  const startEditingTask = (personId: string, taskId: number) => {
    const person = people.find(p => p.id === personId);
    const task = person?.tasks.find(t => t.id === taskId);
    
    if (task) {
      setEditingTask({ personId, taskId });
      setEditForm({ ...task });
      setEditAssignedPerson(personId);
    }
  };

  const saveEditedTask = () => {
    if (!editForm || !editingTask) return;

    const oldPersonId = editingTask.personId;
    const newPersonId = editAssignedPerson;
    const taskId = editingTask.taskId;

    // Päivitä kategoria jos ajankohta muuttui
    let category = editForm.category;
    if (editForm.dueDateType === 'specific' && editForm.dueDate) {
      category = 'scheduled';
    } else if (editForm.dueDateType === 'within_week') {
      category = 'weekly';
    } else if (!editForm.dueDateType || editForm.dueDateType === 'flexible') {
      category = 'today';
    }

    const updatedTask = { ...editForm, category };

    if (editForm.isShared) {
      // Jaettu tehtävä - päivitä kaikille
      setPeople(people.map(person => ({
        ...person,
        tasks: person.tasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      })));
    } else if (oldPersonId !== newPersonId) {
      // Henkilö vaihtui - siirrä tehtävä
      setPeople(people.map(person => {
        if (person.id === oldPersonId) {
          // Poista vanhalta henkilöltä
          return {
            ...person,
            tasks: person.tasks.filter(task => task.id !== taskId)
          };
        } else if (person.id === newPersonId) {
          // Lisää uudelle henkilölle
          return {
            ...person,
            tasks: [...person.tasks, updatedTask]
          };
        }
        return person;
      }));
    } else {
      // Sama henkilö - päivitä tehtävä
      setPeople(people.map(person => 
        person.id === oldPersonId 
          ? {
              ...person,
              tasks: person.tasks.map(task => 
                task.id === taskId ? updatedTask : task
              )
            }
          : person
      ));
    }

    setEditingTask(null);
    setEditForm(null);
    setEditAssignedPerson('');
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditForm(null);
    setEditAssignedPerson('');
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

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} h`;
    }
    return `${hours} h ${remainingMinutes} min`;
  };

  const getTaskStats = (person: Person, category?: 'today' | 'scheduled' | 'weekly') => {
    const filteredTasks = category 
      ? person.tasks.filter(task => task.category === category)
      : person.tasks;
    const completed = filteredTasks.filter(task => task.completed).length;
    const total = filteredTasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getWeekStats = (person: Person) => {
    const weekTasks = person.tasks.filter(task => 
      task.category === 'today' || 
      task.category === 'weekly' || 
      (task.category === 'scheduled' && task.dueDate && isTaskDueThisWeek(task))
    );
    const completed = weekTasks.filter(task => task.completed).length;
    const total = weekTasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  // Suodata tehtävät kategorian mukaan
  const getFilteredTasks = (person: Person, mode: 'day' | 'week') => {
    if (mode === 'day') {
      return person.tasks.filter(task => 
        task.category === 'today' || 
        (task.category === 'scheduled' && task.dueDate && isTaskDueToday(task))
      );
    } else {
      return person.tasks.filter(task => 
        task.category === 'today' || 
        task.category === 'weekly' || 
        (task.category === 'scheduled' && task.dueDate && isTaskDueThisWeek(task))
      );
    }
  };

  const getWeeklyTasks = (person: Person) => {
    return person.tasks.filter(task => task.category === 'weekly' && !task.completed);
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

  // Tarkista onko tehtävä tällä viikolla
  const isTaskDueThisWeek = (task: Task) => {
    if (!task.dueDate) return false;
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Maanantai
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunnuntai
    endOfWeek.setHours(23, 59, 59, 999);
    
    const dueDate = new Date(task.dueDate);
    return dueDate >= startOfWeek && dueDate <= endOfWeek;
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

  const getDayName = (dayOffset: number) => {
    const days = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
    const today = new Date();
    const targetDay = new Date(today);
    targetDay.setDate(today.getDate() + dayOffset);
    return days[targetDay.getDay() === 0 ? 6 : targetDay.getDay() - 1];
  };

  const getTasksForDay = (person: Person, dayOffset: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);
    targetDate.setHours(0, 0, 0, 0);
    
    return person.tasks.filter(task => {
      if (task.category === 'today' && dayOffset === 0) return true;
      if (task.category === 'scheduled' && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === targetDate.getTime();
      }
      return false;
    });
  };

  // Jaa henkilöt riveihin: ensimmäiselle riville max 2, loput haluamallaan tavalla
  const getPersonRows = () => {
    const rows = [];
    const firstRowPeople = people.slice(0, 2);
    const remainingPeople = people.slice(2);
    
    if (firstRowPeople.length > 0) {
      rows.push(firstRowPeople);
    }
    
    // Loput henkilöt: 1-3 per rivi riippuen näytön koosta
    for (let i = 0; i < remainingPeople.length; i += 3) {
      rows.push(remainingPeople.slice(i, i + 3));
    }
    
    return rows;
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

      {/* Henkilöiden tehtävälistat riveittäin */}
      {getPersonRows().map((rowPeople, rowIndex) => (
        <div 
          key={rowIndex} 
          className={`grid gap-6 ${
            rowIndex === 0 
              ? 'grid-cols-1 lg:grid-cols-2' // Ensimmäinen rivi: max 2 henkilöä
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' // Muut rivit: 1-3 henkilöä
          }`}
        >
          {rowPeople.map(person => {
            const currentMode = viewMode[person.id] || 'day';
            const dayStats = getTaskStats(person, 'today');
            const weekStats = getWeekStats(person);
            const weeklyTasks = getWeeklyTasks(person);
            
            return (
              <div key={person.id} className="bg-white rounded-xl border border-slate-200/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`${person.bgColor} p-3 rounded-lg`}>
                    <User className={`h-6 w-6 ${person.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-slate-800">{person.name}n tehtävät</h3>
                      {/* Poista-painike (ei näy äidille ja isille) */}
                      {person.id !== 'person1' && person.id !== 'person2' && (
                        <button
                          onClick={() => deletePerson(person.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors duration-200"
                          title="Poista henkilö"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <button
                        onClick={() => setViewMode({ ...viewMode, [person.id]: 'day' })}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                          currentMode === 'day' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        Päivä
                      </button>
                      <button
                        onClick={() => setViewMode({ ...viewMode, [person.id]: 'week' })}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                          currentMode === 'week' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        Viikko
                      </button>
                    </div>
                  </div>
                </div>

                {/* Edistyminen */}
                <div className={`${person.bgColor} rounded-xl p-4 border border-slate-200/50 mb-6`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-slate-800">
                      {currentMode === 'day' ? 'Tämän päivän edistyminen' : 'Viikon edistyminen'}
                    </span>
                    <span className="text-sm text-slate-600">
                      {currentMode === 'day' 
                        ? `${dayStats.completed}/${dayStats.total} tehtävää`
                        : `${weekStats.completed}/${weekStats.total} tehtävää`
                      }
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${person.color.replace('text-', 'bg-')}`}
                      style={{ 
                        width: `${currentMode === 'day' ? dayStats.percentage : weekStats.percentage}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {currentMode === 'day' ? dayStats.percentage : weekStats.percentage}% valmis
                  </div>
                </div>

                {/* Viikon aikana hoidettavat -palkki */}
                {weeklyTasks.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-green-800 mb-3 flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Viikon aikana hoidettavat ({weeklyTasks.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {weeklyTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center space-x-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                          <span className="text-green-800 truncate">{task.text}</span>
                          {task.estimatedTime && (
                            <span className="text-green-600 text-xs">({formatTime(task.estimatedTime)})</span>
                          )}
                        </div>
                      ))}
                      {weeklyTasks.length > 3 && (
                        <div className="text-xs text-green-600">
                          +{weeklyTasks.length - 3} muuta tehtävää
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tehtävälista */}
                {currentMode === 'day' ? (
                  // Päivänäkymä
                  <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                    {getFilteredTasks(person, 'day').map(task => (
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
                                  Jaettu
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {task.description && (
                            <div className="text-xs text-slate-600 mt-1">{task.description}</div>
                          )}
                          
                          {task.estimatedTime && (
                            <div className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(task.estimatedTime)}</span>
                            </div>
                          )}
                          
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
                          onClick={() => startEditingTask(person.id, task.id)}
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
                    
                    {getFilteredTasks(person, 'day').length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Ei tehtäviä tänään</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Viikkonäkymä
                  <div className="space-y-4 mb-6">
                    {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
                      const dayTasks = getTasksForDay(person, dayOffset);
                      const isToday = dayOffset === 0;
                      
                      return (
                        <div key={dayOffset} className={`border rounded-lg p-3 ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                          <h4 className={`font-medium mb-2 ${isToday ? 'text-blue-800' : 'text-slate-800'}`}>
                            {getDayName(dayOffset)} {isToday && '(Tänään)'}
                          </h4>
                          
                          {dayTasks.length > 0 ? (
                            <div className="space-y-2">
                              {dayTasks.map(task => (
                                <div key={task.id} className={`flex items-center space-x-2 p-2 rounded ${task.completed ? 'opacity-60' : ''}`}>
                                  <button
                                    onClick={() => toggleTask(person.id, task.id)}
                                    className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors duration-200 ${
                                      task.completed
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-slate-300 hover:border-green-500'
                                    }`}
                                  >
                                    {task.completed && <Check className="h-2 w-2" />}
                                  </button>
                                  
                                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                  
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                      {task.text}
                                    </span>
                                    {task.estimatedTime && (
                                      <span className="text-xs text-slate-600 ml-2">({formatTime(task.estimatedTime)})</span>
                                    )}
                                    {task.isShared && (
                                      <Users className="h-3 w-3 text-orange-600 inline ml-1" />
                                    )}
                                  </div>
                                  
                                  <button
                                    onClick={() => startEditingTask(person.id, task.id)}
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
                          ) : (
                            <p className="text-sm text-slate-500">Ei tehtäviä</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Lisää uusi tehtävä - Siirretty loppuun */}
                <div className="space-y-3 border-t border-slate-200 pt-6">
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
                        placeholder="Kuvaus (valinnainen)"
                        value={taskDescription[person.id] || ''}
                        onChange={(e) => setTaskDescription({ ...taskDescription, [person.id]: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>

                    {/* Arvioitu aika */}
                    <div>
                      <input
                        type="number"
                        placeholder="Arvioitu aika (min)"
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
                        Tämä tehtävä näkyy kaikkien henkilöiden listoissa. Ensimmäinen joka merkitsee sen valmiiksi, saa siitä kunnian!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

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
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Henkilön nimi */}
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

              {/* Värin valinta */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Väri</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.color}
                      onClick={() => {
                        setNewPersonColor(option.color);
                        setNewPersonBgColor(option.bgColor);
                      }}
                      className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                        newPersonColor === option.color 
                          ? 'border-slate-800' 
                          : 'border-slate-300 hover:border-slate-400'
                      } ${option.bgColor}`}
                      title={option.label}
                    >
                      <User className={`h-5 w-5 ${option.color} mx-auto`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Esikatselu */}
              {newPersonName && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-slate-800 mb-2">Esikatselu:</h4>
                  <div className="flex items-center space-x-3">
                    <div className={`${newPersonBgColor} p-2 rounded-lg`}>
                      <User className={`h-4 w-4 ${newPersonColor}`} />
                    </div>
                    <span className="font-medium text-slate-800">{newPersonName}n tehtävät</span>
                  </div>
                </div>
              )}
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
                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                  newPersonName.trim()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span>Lisää henkilö</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Muokkauslomake */}
      {editingTask && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Muokkaa tehtävää</h3>
              <button
                onClick={cancelEditing}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Tehtävän nimi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tehtävä</label>
                <input
                  type="text"
                  value={editForm.text}
                  onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Kuvaus */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kuvaus</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Vastuuhenkilö */}
              {!editForm.isShared && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Vastuuhenkilö</label>
                  <select
                    value={editAssignedPerson}
                    onChange={(e) => setEditAssignedPerson(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {people.map(person => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {editForm.isShared && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800">
                    Tämä on jaettu tehtävä, joten sitä ei voi siirtää toiselle henkilölle.
                  </p>
                </div>
              )}

              {/* Prioriteetti */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prioriteetti</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Matala</option>
                  <option value="medium">Keskitaso</option>
                  <option value="high">Korkea</option>
                </select>
              </div>

              {/* Arvioitu aika */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Arvioitu aika (minuuttia)</label>
                <input
                  type="number"
                  value={editForm.estimatedTime || ''}
                  onChange={(e) => setEditForm({ ...editForm, estimatedTime: e.target.value ? parseInt(e.target.value) : undefined })}
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Ajankohta */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ajankohta</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editDueDateType"
                      checked={!editForm.dueDateType || editForm.dueDateType === 'flexible'}
                      onChange={() => setEditForm({ ...editForm, dueDateType: undefined, dueDate: undefined })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Tämän päivän tehtävä</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editDueDateType"
                      checked={editForm.dueDateType === 'specific'}
                      onChange={() => setEditForm({ ...editForm, dueDateType: 'specific' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Tietty päivämäärä</span>
                  </label>
                  
                  {editForm.dueDateType === 'specific' && (
                    <input
                      type="date"
                      value={editForm.dueDate ? editForm.dueDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                      min={new Date().toISOString().split('T')[0]}
                      className="ml-6 px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editDueDateType"
                      checked={editForm.dueDateType === 'within_week'}
                      onChange={() => setEditForm({ ...editForm, dueDateType: 'within_week', dueDate: undefined })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Viikon sisällä hoidettava</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={cancelEditing}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
              >
                Peruuta
              </button>
              <button
                onClick={saveEditedTask}
                disabled={!editForm.text.trim()}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                  editForm.text.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Save className="h-4 w-4" />
                <span>Tallenna</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoLists;