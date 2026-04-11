// src/context/NotificationContext.js
// Global notification system — bell icon, badge count, notification center
import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    {
      id: 1, type: 'alert', read: false,
      title: 'Low Moisture Alert',
      titleHi: 'कम नमी चेतावनी',
      titleMr: 'कमी ओलावा इशारा',
      body: 'Node 3 (South Field) moisture at 28% — needs irrigation',
      bodyHi: 'नोड 3 (दक्षिणी खेत) नमी 28% — सिंचाई आवश्यक',
      bodyMr: 'नोड 3 (दक्षिण शेत) ओलावा 28% — सिंचन आवश्यक',
      icon: 'water-alert',
      color: '#EF4444',
      time: '9:45 AM',
    },
    {
      id: 2, type: 'tip', read: false,
      title: 'AI Crop Tip',
      titleHi: 'AI फसल सुझाव',
      titleMr: 'AI पीक टिप',
      body: 'Best time to spray fertilizer is early morning (6–8 AM)',
      bodyHi: 'खाद छिड़कने का सबसे अच्छा समय सुबह 6–8 बजे है',
      bodyMr: 'खत फवारण्याचा सर्वोत्तम वेळ सकाळी 6–8 वाजता आहे',
      icon: 'lightbulb-on',
      color: '#F59E0B',
      time: '8:30 AM',
    },
    {
      id: 3, type: 'success', read: true,
      title: 'Sensor N2 Online',
      titleHi: 'सेंसर N2 ऑनलाइन',
      titleMr: 'सेन्सर N2 ऑनलाइन',
      body: 'East Field node reconnected — showing 72% moisture',
      bodyHi: 'पूर्वी खेत नोड पुनः जुड़ा — नमी 72%',
      bodyMr: 'पूर्व शेत नोड पुन्हा जोडला — ओलावा 72%',
      icon: 'check-circle',
      color: '#10B981',
      time: 'Yesterday',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [{ ...notif, id: Date.now(), read: false }, ...prev]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
