import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, X } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: Date;
  time: string;
  color: string;
  description?: string;
  location?: string;
}

interface NewEvent {
  title: string;
  date: string;
  time: string;
  color: string;
  description: string;
  location: string;
}

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([
    { id: 1, title: 'Lääkäriaika', date: new Date(2025, 0, 15), time: '10:00', color: 'bg-blue-500', description: 'Vuositarkastus', location: 'Terveysasema' },
    { id: 2, title: 'Jalkapalloharjoitukset', date: new Date(2025, 0, 16), time: '18:00', color: 'bg-green-500', description: 'Viikkoharjoitukset', location: 'Urheilukeskus' },
    { id: 3, title: 'Perhepäivällinen', date: new Date(2025, 0, 18), time: '19:00', color: 'bg-purple-500', description: 'Isovanhempien kanssa', location: 'Koti' },
    { id: 4, title: 'Koulukokous', date: new Date(2025, 0, 20), time: '15:00', color: 'bg-orange-500', description: 'Vanhempainilta', location: 'Koulu' },
  ]);

  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    color: 'bg-blue-500',
    description: '',
    location: ''
  });

  const monthNames = [
    'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
    'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
  ];

  const dayNames = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

  const eventColors = [
    { value: 'bg-blue-500', label: 'Sininen', preview: 'bg-blue-500' },
    { value: 'bg-green-500', label: 'Vihreä', preview: 'bg-green-500' },
    { value: 'bg-purple-500', label: 'Violetti', preview: 'bg-purple-500' },
    { value: 'bg-orange-500', label: 'Oranssi', preview: 'bg-orange-500' },
    { value: 'bg-red-500', label: 'Punainen', preview: 'bg-red-500' },
    { value: 'bg-pink-500', label: 'Pinkki', preview: 'bg-pink-500' },
    { value: 'bg-yellow-500', label: 'Keltainen', preview: 'bg-yellow-500' },
    { value: 'bg-indigo-500', label: 'Indigo', preview: 'bg-indigo-500' },
  ];

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

    const eventDate = new Date(newEvent.date);
    const event: Event = {
      id: Date.now(),
      title: newEvent.title.trim(),
      date: eventDate,
      time: newEvent.time,
      color: newEvent.color,
      description: newEvent.description.trim() || undefined,
      location: newEvent.location.trim() || undefined
    };

    setEvents([...events, event]);
    
    // Tyhjennä lomake
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      color: 'bg-blue-500',
      description: '',
      location: ''
    });
    
    setShowAddEventModal(false);
  };

  const deleteEvent = (eventId: number) => {
    setEvents(events.filter(event => event.id !== eventId));
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

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    
    return (
      <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50">
          {dayNames.map((day) => (
            <div key={day} className="p-4 text-center font-medium text-slate-700 border-r border-slate-200 last:border-r-0">
              {day}
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
                className={`min-h-24 p-2 border-r border-b border-slate-200 last:border-r-0 hover:bg-slate-50 transition-colors duration-200 ${
                  !isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`${event.color} text-white text-xs p-1 rounded truncate group relative cursor-pointer`}
                      title={`${event.title} - ${event.time}${event.location ? ` @ ${event.location}` : ''}`}
                    >
                      <span>{event.title}</span>
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
                  ))}
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
        <div className="grid grid-cols-8 bg-slate-50">
          <div className="p-4 border-r border-slate-200"></div>
          {days.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const dayOfWeek = day.getDay();
            const dayName = dayOfWeek === 0 ? 'Su' : dayNames[dayOfWeek - 1];
            return (
              <div key={index} className="p-4 text-center border-r border-slate-200 last:border-r-0">
                <div className="font-medium text-slate-700">{dayName}</div>
                <div className={`text-lg font-semibold mt-1 ${
                  isToday ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-slate-800'
                }`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-200 last:border-b-0">
              <div className="p-2 text-sm text-slate-600 border-r border-slate-200 text-right">
                {hour === 0 ? '00:00' : hour < 10 ? `0${hour}:00` : `${hour}:00`}
              </div>
              {days.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day).filter(event => {
                  const eventHour = parseInt(event.time.split(':')[0]);
                  return eventHour === hour;
                });
                
                return (
                  <div key={dayIndex} className="p-1 min-h-12 border-r border-slate-200 last:border-r-0 hover:bg-slate-50 transition-colors duration-200">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`${event.color} text-white text-xs p-1 rounded mb-1 group relative cursor-pointer`}
                        title={`${event.title}${event.location ? ` @ ${event.location}` : ''}`}
                      >
                        <span>{event.title}</span>
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
                    ))}
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-slate-800">Kalenteri</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => view === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h3 className="text-lg font-semibold text-slate-800 min-w-48 text-center">
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
        
        <div className="flex items-center space-x-3">
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
            onClick={() => setShowAddEventModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Lisää tapahtuma</span>
          </button>
        </div>
      </div>

      {/* Kalenteriruudukko */}
      {view === 'month' ? renderMonthView() : renderWeekView()}

      {/* Tulevat tapahtumat */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Tulevat tapahtumat</h3>
        <div className="space-y-3">
          {events
            .filter(event => event.date >= new Date())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((event) => (
            <div key={event.id} className="flex items-center space-x-4 p-3 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors duration-200 group">
              <div className={`w-4 h-4 rounded-full ${event.color}`}></div>
              <div className="flex-1">
                <div className="font-medium text-slate-800">{event.title}</div>
                <div className="text-sm text-slate-600 flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{event.date.toLocaleDateString('fi-FI')}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{event.time}</span>
                  </span>
                  {event.location && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </span>
                  )}
                </div>
                {event.description && (
                  <div className="text-sm text-slate-500 mt-1">{event.description}</div>
                )}
              </div>
              <button
                onClick={() => deleteEvent(event.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {events.filter(event => event.date >= new Date()).length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Ei tulevia tapahtumia</p>
            </div>
          )}
        </div>
      </div>

      {/* Lisää tapahtuma -modaali */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Lisää uusi tapahtuma</h3>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
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

              {/* Päivämäärä ja aika */}
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Aika *
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Väri */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Väri
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {eventColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                      className={`flex items-center space-x-2 p-2 rounded-lg border-2 transition-colors duration-200 ${
                        newEvent.color === color.value 
                          ? 'border-slate-400 bg-slate-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${color.preview}`}></div>
                      <span className="text-xs text-slate-700">{color.label}</span>
                    </button>
                  ))}
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
              {newEvent.title && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-slate-800 mb-2">Esikatselu:</h4>
                  <div className={`${newEvent.color} text-white text-sm p-2 rounded inline-block`}>
                    {newEvent.title}
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    {new Date(newEvent.date).toLocaleDateString('fi-FI')} klo {newEvent.time}
                    {newEvent.location && ` @ ${newEvent.location}`}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddEventModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
              >
                Peruuta
              </button>
              <button
                onClick={addEvent}
                disabled={!newEvent.title.trim()}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  newEvent.title.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Lisää tapahtuma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;