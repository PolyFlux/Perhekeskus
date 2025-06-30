import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const monthNames = [
    'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
    'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
  ];

  const dayNames = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

  const sampleEvents = [
    { id: 1, title: 'Lääkäriaika', date: new Date(2025, 0, 15), time: '10:00', color: 'bg-blue-500' },
    { id: 2, title: 'Jalkapalloharjoitukset', date: new Date(2025, 0, 16), time: '18:00', color: 'bg-green-500' },
    { id: 3, title: 'Perhepäivällinen', date: new Date(2025, 0, 18), time: '19:00', color: 'bg-purple-500' },
    { id: 4, title: 'Koulukokous', date: new Date(2025, 0, 20), time: '15:00', color: 'bg-orange-500' },
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
    return sampleEvents.filter(event => isSameDay(event.date, date));
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
                      className={`${event.color} text-white text-xs p-1 rounded truncate`}
                      title={`${event.title} - ${event.time}`}
                    >
                      {event.title}
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
                        className={`${event.color} text-white text-xs p-1 rounded mb-1`}
                      >
                        {event.title}
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
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
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
          {sampleEvents.map((event) => (
            <div key={event.id} className="flex items-center space-x-4 p-3 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors duration-200">
              <div className={`w-4 h-4 rounded-full ${event.color}`}></div>
              <div className="flex-1">
                <div className="font-medium text-slate-800">{event.title}</div>
                <div className="text-sm text-slate-600">
                  {event.date.toLocaleDateString('fi-FI')} klo {event.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;