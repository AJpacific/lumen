import React, { useEffect, useState, useRef, useContext } from 'react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/userService.js';
import { NotificationContext } from '../context/NotificationContext.jsx';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const { showNotification } = useContext(NotificationContext);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUserNotifications({ limit: 10 });
      const data = res?.data || res; // service may or may not unwrap
      setItems(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleOpen = () => {
    setOpen(v => !v);
    if (!open) fetchNotifications();
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleCopyOffer = async (code) => {
    try {
      await navigator.clipboard?.writeText(code);
      showNotification(`Offer code ${code} copied`, 'success');
    } catch {
      showNotification('Failed to copy code', 'error');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleOpen} className="relative hover:bg-blue-700 px-3 py-2 rounded transition-colors">
        <span role="img" aria-label="bell">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded shadow-lg z-50 border">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="font-medium text-sm">Notifications</span>
            <button className="text-xs text-blue-600 hover:underline" onClick={handleMarkAll}>Mark all as read</button>
          </div>
          {loading ? (
            <div className="p-3 text-sm text-gray-600">Loading...</div>
          ) : error ? (
            <div className="p-3 text-sm text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-3 text-sm text-gray-600">No notifications</div>
          ) : (
            <ul className="max-h-96 overflow-auto divide-y">
              {items.map(n => (
                <li key={n.id} className={`px-3 py-2 ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm">{n.message}</p>
                      {n.data?.offer && (
                        <div className="mt-1 text-xs bg-gray-50 rounded p-2 border">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Attached Offer</span>
                            <span className="font-mono bg-gray-200 px-1 rounded">{n.data.offer.code}</span>
                          </div>
                          <div className="mt-1 text-gray-700">
                            <span>{n.data.offer.name}</span>
                            <span className="ml-2">{n.data.offer.type === 'percentage' ? `${n.data.offer.value}% OFF` : `$${n.data.offer.value} OFF`}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <button className="btn btn-success btn-sm" onClick={() => handleCopyOffer(n.data.offer.code)}>Copy Code</button>
                            <a href="/user/offers" className="text-blue-600 hover:underline">View offers</a>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                    </div>
                    {!n.read && (
                      <button className="text-xs text-blue-600 hover:underline" onClick={() => handleMarkRead(n.id)}>Mark read</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="px-3 py-2 border-t text-xs text-gray-600">Showing latest {items.length} notifications</div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;


