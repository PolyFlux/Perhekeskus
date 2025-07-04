import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, X, Settings, Edit2, Trash2 } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  categoryId: string;
  description?: string;
  location?: string;
}

interface EventCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface NewEvent {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  categoryId: string;
  description: string;
  location: string;
}

interface NewCategory {
  name: string;
  color: string;
  description: string;
}

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('week');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);
  const weekScrollRef = useRef<HTMLDivElement>(null);

  // Oletuskategoriat
  const [categories, setCategories] = useState<EventCategory[]>([
    { id: 'health', name: 'Terveys', color: 'bg-blue-500', description: 'Lääkärikäynnit, hammaslääkäri, terapia' },
    { id: 'sports', name: 'Urheilu', color: 'bg-green-500', description: 'Harjoitukset, kilpailut, liikunta' },
    { id: 'family', name: 'Perhe', color: 'bg-purple-500', description: 'Perhejuhlat, yhdessäolo, matkat' },
    { id: 'school', name: 'Koulu/Työ', color: 'bg-orange-500', description: 'Kokoukset, vanhempainillat, työasiat' },
    { id: 'personal', name: 'Henkilökohtainen', color: 'bg-pink-500', description: 'Omat menot, harrastukset' },
    { id: 'household', name: 'Kotitalous', color: 'bg-yellow-500', description: 'Siivous, korjaukset, ostokset' },
    { id: 'social', name: 'Sosiaaliset', color: 'bg-indigo-500', description: 'Ystävät, juhlat, tapahtumat' },
    { id: 'other', name: 'Muu', color: 'bg-slate-500', description: 'Muut tapahtumat' },
  ]);

  const [events, setEvents] = useState<Event[]>([
    { id: 1, title: 'Lääkäriaika', date: new Date(2025, 0, 15), startTime: '10:00', endTime: '10:30', categoryId: 'health', description: 'Vuositarkastus', location: 'Terveysasema' },
    { id: 2, title: 'Jalkapalloharjoitukset', date: new Date(2025, 0, 16), startTime: '18:00', endTime: '19:30', categoryId: 'sports', description: 'Viikkoharjoitukset', location: 'Urheilukeskus' },
    { id: 3, title: 'Perhepäivällinen', date: new Date(2025, 0, 18), startTime: '19:00', endTime: '21:00', categoryId: 'family', description: 'Isovanhempien kanssa', location: 'Koti' },
    { id: 4, title: 'Koulukokous', date: new Date(2025, 0, 20), startTime: '15:00', endTime: '16:00', categoryId: 'school', description: 'Vanhempainilta', location: 'Koulu' },
    { id: 5, title: 'Aamukokous', date: new Date(2025, 0, 21), startTime: '08:00', endTime: '09:00', categoryId: 'school', description: 'Tiimin palaveri', location: 'Toimisto' },
    { id: 6, title: 'Lounastapahtuma', date: new Date(2025, 0, 21), startTime: '12:00', endTime: '13:30', categoryId: 'social', description: 'Ystävien kanssa', location: 'Ravintola' },
    { id: 7, title: 'Iltaharjoitus', date: new Date(2025, 0, 21), startTime: '19:00', endTime: '20:30', categoryId: 'sports', description: 'Kuntosali', location: 'Liikuntakeskus' },
  ]);

  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '12:00',
    endTime: '13:00',
    categoryId: 'other',
    description: '',
    location: ''
  });

  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    color: 'bg-blue-500',
    description: ''
  });

  const monthNames = [
    'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
    'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
  ];

  const dayNames = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

  const availableColors = [
    { value: 'bg-blue-500', label: 'Sininen', preview: 'bg-blue-500' },
    { value: 'bg-green-500', label: 'Vihreä', preview: 'bg-green-500' },
    { value: 'bg-purple-500', label: 'Violetti', preview: 'bg-purple-500' },
    { value: 'bg-orange-500', label: 'Oranssi', preview: 'bg-orange-500' },
    { value: 'bg-red-500', label: 'Punainen', preview: 'bg-red-500' },
    { value: 'bg-pink-500', label: 'Pinkki', preview: 'bg-pink-500' },
    { value: 'bg-yellow-500', label: 'Keltainen', preview: 'bg-yellow-500' },
    { value: 'bg-indigo-500', label: 'Indigo', preview: 'bg-indigo-500' },
    { value: 'bg-teal-500', label: 'Turkoosi', preview: 'bg-teal-500' },
    { value: 'bg-cyan-500', label: 'Syaani', preview: 'bg-cyan-500' },
    { value: 'bg-lime-500', label: 'Lime', preview: 'bg-lime-500' },
    { value: 'bg-slate-500', label: 'Harmaa', preview: 'bg-slate-500' },
  ];

  // Skrollaa viikkonäkymässä klo 7:00 kohdalle sivun latautuessa
  useEffect(() => {
    if (view === 'week' && weekScrollRef.current) {
      // Skrollaa klo 7:00 kohdalle (7 * 48px per tunti)
      const scrollPosition = 7 * 48;
      weekScrollRef.current.scrollTop = scrollPosition;
    }
  }, [view]);

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories.find(cat => cat.id === 'other')!;
  };

  // Validoi että päättymisaika on alkamisajan jälkeen
  const validateEventTimes = (startTime: string, endTime: string): boolean => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return end > start;
  };

  // Automaattisesti säädä päättymisaikaa kun alkamisaikaa muutetaan
  const handleStartTimeChange = (startTime: string) => {
    setNewEvent(prev => {
      const newStartTime = startTime;
      let newEndTime = prev.endTime;
      
      // Jos päättymisaika on ennen alkamisaikaa, lisää tunti alkamisaikaan
      if (!validateEventTimes(newStartTime, prev.endTime)) {
        const start = new Date(`2000-01-01T${newStartTime}`);
        start.setHours(start.getHours() + 1);
        newEndTime = start.toTimeString().slice(0, 5);
      }
      
      return {
        ...prev,
        startTime: newStartTime,
        endTime: newEndTime
      };
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    if (!validateEventTimes(newEvent.startTime, newEvent.endTime)) {
      alert('Päättymisajan tulee olla alkamisajan jälkeen');
      return;
    }

    const eventDate = new Date(newEvent.date);
    const event: Event = {
      id: Date.now(),
      title: newEvent.title.trim(),
      date: eventDate,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      categoryId: newEvent.categoryId,
      description: newEvent.description.trim() || undefined,
      location: newEvent.location.trim() || undefined
    };

    setEvents([...events, event]);
    
    // Tyhjennä lomake
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '12:00',
      endTime: '13:00',
      categoryId: 'other',
      description: '',
      location: ''
    });
    
    setShowAddEventModal(false);
  };

  const deleteEvent = (eventId: number) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const addCategory = () => {
    if (!newCategory.name.trim()) return;

    const category: EventCategory = {
      id: Date.now().toString(),
      name: newCategory.name.trim(),
      color: newCategory.color,
      description: newCategory.description.trim() || undefined
    };

    setCategories([...categories, category]);
    
    // Tyhjennä lomake
    setNewCategory({
      name: '',
      color: 'bg-blue-500',
      description: ''
    });
    
    setShowAddCategoryModal(false);
  };

  const updateCategory = (categoryId: string, updates: Partial<EventCategory>) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (categoryId: string) => {
    // Tarkista onko kategoriassa tapahtumia
    const hasEvents = events.some(event => event.categoryId === categoryId);
    
    if (hasEvents) {
      // Siirrä tapahtumat "Muu" -kategoriaan
      setEvents(events.map(event => 
        event.categoryId === categoryId 
          ? { ...event, categoryId: 'other' }
          : event
      ));
    }
    
    // Poista kategoria (paitsi "Muu" -kategoria)
    if (categoryId !== 'other') {
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const startEditingCategory = (category: EventCategory) => {
    setEditingCategory({ ...category });
  };

  const saveEditingCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        color: editingCategory.color,
        description: editingCategory.description?.trim() || undefined
      });
      setEditingCategory(null);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Aloita maanantaista (1) eikä sunnuntaista (0)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Jos sunnuntai (0), vähennä 6, muuten vähennä (päivä - 1)
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    // Säädä alkamaan maanantaista
    const daysToSubtract = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(startOfWeek));
      startOfWeek.setDate(startOfWeek.getDate() + 1);
    }
    return days;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const formatEventTime = (event: Event) => {
    return `${event.startTime}-${event.endTime}`;
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    
    return (
      <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50">
          {dayNames.map((day) => (
            <div key={day} className="p-2 md:p-4 text-center font-medium text-slate-700 border-r border-slate-200 last:border-r-0 text-xs md:text-sm">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(day, new Date());
            const dayEvents = getEventsForDay(day);
            
            return (
              <div
                key={index}
                className={`min-h-16 md:min-h-24 p-1 md:p-2 border-r border-b border-slate-200 last:border-r-0 hover:bg-slate-50 transition-colors duration-200 ${
                  !isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : ''
                }`}
              >
                <div className={`text-xs md:text-sm font-medium mb-1 ${
                  isToday ? 'bg-blue-600 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs' : ''
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => {
                    const category = getCategoryById(event.categoryId);
                    return (
                      <div
                        key={event.id}
                        className={`${category.color} text-white text-xs p-1 rounded truncate group relative cursor-pointer`}
                        title={`${event.title} - ${formatEventTime(event)}${event.location ? ` @ ${event.location}` : ''} (${category.name})`}
                      >
                        <span className="text-xs">{event.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEvent(event.id);
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{dayEvents.length - 2} lisää
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

  const renderWeekView = () => {
    const days = getWeekDays(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden">
        {/* Päivien otsikot */}
        <div className="grid grid-cols-8 bg-slate-50 sticky top-0 z-10">
          <div className="p-2 md:p-4 border-r border-slate-200 text-xs md:text-sm font-medium text-slate-700">Aika</div>
          {days.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const dayOfWeek = day.getDay();
            const dayName = dayOfWeek === 0 ? 'Su' : dayNames[dayOfWeek - 1];
            return (
              <div key={index} className="p-2 md:p-4 text-center border-r border-slate-200 last:border-r-0">
                <div className="font-medium text-slate-700 text-xs md:text-sm">
                  <span className="hidden sm:inline">{dayName}</span>
                  <span className="sm:hidden">{dayName.charAt(0)}</span>
                </div>
                <div className={`text-sm md:text-lg font-semibold mt-1 ${
                  isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center mx-auto text-xs md:text-base' : 'text-slate-800'
                }`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Vieritettävä aikataulu */}
        <div 
          ref={weekScrollRef}
          className="max-h-[60vh] md:max-h-96 overflow-y-auto"
        >
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-200 last:border-b-0" style={{ minHeight: '48px' }}>
              <div className="p-1 md:p-2 text-xs md:text-sm text-slate-600 border-r border-slate-200 text-right flex items-start justify-end">
                <span className="bg-slate-50 px-1 rounded text-xs">
                  {hour === 0 ? '00:00' : hour < 10 ? `0${hour}:00` : `${hour}:00`}
                </span>
              </div>
              {days.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day).filter(event => {
                  const eventHour = parseInt(event.startTime.split(':')[0]);
                  return eventHour === hour;
                });
                
                return (
                  <div key={dayIndex} className="p-1 border-r border-slate-200 last:border-r-0 hover:bg-slate-50 transition-colors duration-200 relative">
                    {dayEvents.map((event) => {
                      const category = getCategoryById(event.categoryId);
                      const startMinutes = parseInt(event.startTime.split(':')[1]);
                      const endHour = parseInt(event.endTime.split(':')[0]);
                      const endMinutes = parseInt(event.endTime.split(':')[1]);
                      
                      // Laske tapahtuman kesto ja sijainti
                      const durationInMinutes = (endHour * 60 + endMinutes) - (hour * 60 + startMinutes);
                      const height = Math.max(20, (durationInMinutes / 60) * 48);
                      const topOffset = (startMinutes / 60) * 48;
                      
                      return (
                        <div
                          key={event.id}
                          className={`${category.color} text-white text-xs p-1 md:p-2 rounded mb-1 group relative cursor-pointer absolute left-1 right-1 z-20`}
                          style={{ 
                            top: `${topOffset}px`,
                            height: `${height}px`,
                            minHeight: '20px'
                          }}
                          title={`${event.title} - ${formatEventTime(event)}${event.location ? ` @ ${event.location}` : ''} (${category.name})`}
                        >
                          <div className="font-medium truncate text-xs">{event.title}</div>
                          <div className="text-xs opacity-75 truncate">{formatEventTime(event)}</div>
                          {event.location && height > 40 && (
                            <div className="text-xs opacity-75 truncate">{event.location}</div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event.id);
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Otsikko */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <h2 className="text-2xl font-bold text-slate-800">Kalenteri</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => view === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h3 className="text-sm md:text-lg font-semibold text-slate-800 min-w-32 md:min-w-48 text-center">
              {view === 'month' 
                ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : `Viikko ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
              }
            </h3>
            <button
              onClick={() => view === 'month' ? navigateMonth('next') : navigateWeek('next')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                view === 'month' ? 'bg-white text-slate-800 shadow' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Kuukausi
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                view === 'week' ? 'bg-white text-slate-800 shadow' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Viikko
            </button>
          </div>
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="flex items-center justify-center space-x-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors duration-200"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Kategoriat</span>
          </button>
          <button 
            onClick={() => setShowAddEventModal(true)}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Lisää tapahtuma</span>
          </button>
        </div>
      </div>

      {/* Kategorialegenda - piilotettu pienillä näytöillä */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200/50 p-4">
        <h3 className="text-sm font-medium text-slate-800 mb-3">Kategoriat</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2 bg-slate-50 rounded-lg px-3 py-1">
              <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
              <span className="text-sm text-slate-700">{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kalenteriruudukko */}
      {view === 'month' ? renderMonthView() : renderWeekView()}

      {/* Tulevat tapahtumat */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-4 md:p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Tulevat tapahtumat</h3>
        <div className="space-y-3 max-h-64 md:max-h-80 overflow-y-auto">
          {events
            .filter(event => event.date >= new Date())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((event) => {
              const category = getCategoryById(event.categoryId);
              return (
                <div key={event.id} className="flex items-center space-x-3 md:space-x-4 p-3 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors duration-200 group">
                  <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${category.color} flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                      <span className="font-medium text-slate-800 truncate">{event.title}</span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full w-fit">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                      <span className="flex items-center space-x-1">
                        <CalendarIcon className="h-3 w-3 flex-shrink-0" />
                        <span>{event.date.toLocaleDateString('fi-FI')}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>{formatEventTime(event)}</span>
                      </span>
                      {event.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <div className="text-sm text-slate-500 mt-1 truncate">{event.description}</div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all duration-200 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          {events.filter(event => event.date >= new Date()).length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Ei tulevia tapahtumia</p>
            </div>
          )}
        </div>
      </div>

      {/* Kategorioiden hallinta -modaali */}
      {showCategoriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Kiinteä otsikko */}
            <div className="p-4 md:p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Hallinnoi kategorioita</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Uusi kategoria</span>
                  </button>
                  <button
                    onClick={() => setShowCategoriesModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Vieritettävä sisältö */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-3">
                {categories.map((category) => {
                  const eventCount = events.filter(event => event.categoryId === category.id).length;
                  const isEditing = editingCategory?.id === category.id;
                  
                  return (
                    <div key={category.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                      <div className={`w-6 h-6 rounded-full ${category.color} flex-shrink-0`}></div>
                      
                      {isEditing ? (
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <textarea
                            value={editingCategory.description || ''}
                            onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                            placeholder="Kuvaus (valinnainen)"
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                          <div className="grid grid-cols-6 gap-2">
                            {availableColors.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => setEditingCategory({ ...editingCategory, color: color.value })}
                                className={`w-8 h-8 rounded-full ${color.preview} border-2 transition-colors duration-200 ${
                                  editingCategory.color === color.value ? 'border-slate-800' : 'border-slate-300'
                                }`}
                                title={color.label}
                              />
                            ))}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={saveEditingCategory}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors duration-200"
                            >
                              Tallenna
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="bg-slate-600 text-white px-3 py-1 rounded text-sm hover:bg-slate-700 transition-colors duration-200"
                            >
                              Peruuta
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-800">{category.name}</div>
                            {category.description && (
                              <div className="text-sm text-slate-600 truncate">{category.description}</div>
                            )}
                            <div className="text-xs text-slate-500 mt-1">
                              {eventCount} tapahtuma{eventCount !== 1 ? 'a' : ''}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEditingCategory(category)}
                              className="text-slate-400 hover:text-blue-600 transition-colors duration-200"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {category.id !== 'other' && (
                              <button
                                onClick={() => deleteCategory(category.id)}
                                className="text-slate-400 hover:text-red-600 transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lisää kategoria -modaali */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col">
            {/* Kiinteä otsikko */}
            <div className="p-4 md:p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Luo uusi kategoria</h3>
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Vieritettävä sisältö */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kategorian nimi *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Esim. Harrastukset, Lääkärikäynnit..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kuvaus
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Mitä tähän kategoriaan kuuluu..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Väri
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                        className={`w-10 h-10 rounded-full ${color.preview} border-2 transition-colors duration-200 ${
                          newCategory.color === color.value ? 'border-slate-800' : 'border-slate-300'
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Esikatselu */}
                {newCategory.name && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-slate-800 mb-2">Esikatselu:</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${newCategory.color}`}></div>
                      <span className="text-sm font-medium text-slate-800">{newCategory.name}</span>
                    </div>
                    {newCategory.description && (
                      <div className="text-xs text-slate-600 mt-1 ml-6">{newCategory.description}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Kiinteät painikkeet */}
            <div className="p-4 md:p-6 border-t border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                >
                  Peruuta
                </button>
                <button
                  onClick={addCategory}
                  disabled={!newCategory.name.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    newCategory.name.trim()
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Luo kategoria
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lisää tapahtuma -modaali */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col">
            {/* Kiinteä otsikko */}
            <div className="p-4 md:p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Lisää uusi tapahtuma</h3>
                <button
                  onClick={() => setShowAddEventModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Vieritettävä sisältö */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-4">
                {/* Otsikko */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tapahtuman nimi *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Syötä tapahtuman nimi..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Päivämäärä */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Päivämäärä *
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Alkamis- ja päättymisaika */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Alkamisaika *
                    </label>
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Päättymisaika *
                    </label>
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !validateEventTimes(newEvent.startTime, newEvent.endTime) 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-slate-300'
                      }`}
                    />
                    {!validateEventTimes(newEvent.startTime, newEvent.endTime) && (
                      <p className="text-red-600 text-xs mt-1">Päättymisajan tulee olla alkamisajan jälkeen</p>
                    )}
                  </div>
                </div>

                {/* Kategoria */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kategoria
                  </label>
                  <select
                    value={newEvent.categoryId}
                    onChange={(e) => setNewEvent({ ...newEvent, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${getCategoryById(newEvent.categoryId).color}`}></div>
                    <span className="text-xs text-slate-600">
                      {getCategoryById(newEvent.categoryId).description}
                    </span>
                  </div>
                </div>

                {/* Sijainti */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sijainti
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Esim. Koti, Toimisto, Ravintola..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Kuvaus */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kuvaus
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Lisätietoja tapahtumasta..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Esikatselu */}
                {newEvent.title && validateEventTimes(newEvent.startTime, newEvent.endTime) && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-slate-800 mb-2">Esikatselu:</h4>
                    <div className={`${getCategoryById(newEvent.categoryId).color} text-white text-sm p-2 rounded inline-block`}>
                      {newEvent.title}
                    </div>
                    <div className="text-xs text-slate-600 mt-2 flex flex-wrap items-center gap-2">
                      <span>{new Date(newEvent.date).toLocaleDateString('fi-FI')}</span>
                      <span>•</span>
                      <span>{newEvent.startTime}-{newEvent.endTime}</span>
                      <span>•</span>
                      <span>{getCategoryById(newEvent.categoryId).name}</span>
                      {newEvent.location && (
                        <>
                          <span>•</span>
                          <span>{newEvent.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Kiinteät painikkeet */}
            <div className="p-4 md:p-6 border-t border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                >
                  Peruuta
                </button>
                <button
                  onClick={addEvent}
                  disabled={!newEvent.title.trim() || !validateEventTimes(newEvent.startTime, newEvent.endTime)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    newEvent.title.trim() && validateEventTimes(newEvent.startTime, newEvent.endTime)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Lisää tapahtuma
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;