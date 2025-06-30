import React, { useState } from 'react';
import { Plus, Check, X, User, Users } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
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
        { id: 1, text: 'Ruokaostokset', completed: false, priority: 'high' },
        { id: 2, text: 'Soita hammaslääkärille ajanvarausta varten', completed: false, priority: 'medium' },
        { id: 3, text: 'Hae kuivapesu', completed: true, priority: 'low' },
        { id: 4, text: 'Valmista illallinen', completed: false, priority: 'high' },
      ]
    },
    {
      id: 'person2',
      name: 'Isä',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      tasks: [
        { id: 5, text: 'Korjaa keittiön hana', completed: false, priority: 'high' },
        { id: 6, text: 'Varaa auton huolto', completed: false, priority: 'medium' },
        { id: 7, text: 'Maksa sähkölasku', completed: true, priority: 'high' },
        { id: 8, text: 'Siivoa autotalli', completed: false, priority: 'low' },
      ]
    }
  ]);

  const [newTask, setNewTask] = useState<{ [key: string]: string }>({});
  const [selectedPriority, setSelectedPriority] = useState<{ [key: string]: 'low' | 'medium' | 'high' }>({});

  const addTask = (personId: string) => {
    const taskText = newTask[personId]?.trim();
    if (!taskText) return;

    const newTaskObj: Task = {
      id: Date.now(),
      text: taskText,
      completed: false,
      priority: selectedPriority[personId] || 'medium'
    };

    setPeople(people.map(person => 
      person.id === personId 
        ? { ...person, tasks: [...person.tasks, newTaskObj] }
        : person
    ));

    setNewTask({ ...newTask, [personId]: '' });
    setSelectedPriority({ ...selectedPriority, [personId]: 'medium' });
  };

  const toggleTask = (personId: string, taskId: number) => {
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
  };

  const deleteTask = (personId: string, taskId: number) => {
    setPeople(people.map(person => 
      person.id === personId 
        ? { ...person, tasks: person.tasks.filter(task => task.id !== taskId) }
        : person
    ));
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

  const getTaskStats = (person: Person) => {
    const completed = person.tasks.filter(task => task.completed).length;
    const total = person.tasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  return (
    <div className="space-y-6">
      {/* Otsikko */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Perheen tehtävälistat</h2>
        <p className="text-slate-600">Hallinnoi päivittäisiä tehtäviä jokaiselle perheenjäsenelle</p>
      </div>

      {/* Kokonaisedistyminen */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Tämän päivän edistyminen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </div>

      {/* Yksittäiset tehtävälistat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {people.map(person => (
          <div key={person.id} className="bg-white rounded-xl border border-slate-200/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
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
            </div>

            {/* Tehtävälista */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {person.tasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                    task.completed 
                      ? 'bg-slate-50 border-slate-200 opacity-60' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
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
                  
                  <span className={`flex-1 ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                    {task.text}
                  </span>
                  
                  <button
                    onClick={() => deleteTask(person.id, task.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {person.tasks.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Ei tehtäviä vielä. Lisää yksi yllä!</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoLists;