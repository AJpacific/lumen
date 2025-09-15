import React, { useState, useContext } from 'react';
import { sendNotification, sendNotificationToRole, getDiscounts, getAllUsers } from '../../services/adminService.js';
import { NotificationContext } from '../../context/NotificationContext.jsx';

const SendNotifications = () => {
  const [mode, setMode] = useState('role'); // 'role' | 'users'
  const [role, setRole] = useState('user');
  const [userQuery, setUserQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [offerId, setOfferId] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [offers, setOffers] = useState([]);
  const { showNotification } = useContext(NotificationContext);

  const fetchOffers = async () => {
    try {
      const res = await getDiscounts({ isActive: true, sortBy: 'endDate', sortOrder: 'asc', limit: 100 });
      setOffers(Array.isArray(res) ? res : (res?.discounts || []));
    } catch (e) {
      setOffers([]);
    }
  };

  const searchUsers = async () => {
    try {
      const res = await getAllUsers({ search: userQuery, limit: 20 });
      const rows = res?.data?.users || res?.users || [];
      setUsers(rows);
    } catch (e) {
      setUsers([]);
    }
  };

  const handleToggleUser = (id) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      showNotification('Please enter a message', 'warning');
      return;
    }
    setLoading(true);
    try {
      const data = {};
      if (offerId) {
        const offer = offers.find(o => o._id === offerId);
        if (offer) data.offer = { id: offer._id, code: offer.code, name: offer.name, type: offer.type, value: offer.value };
      }
      let resp;
      if (mode === 'role') {
        resp = await sendNotificationToRole({ role, message, type, data });
      } else {
        if (selectedUserIds.length === 0) {
          showNotification('Select at least one user', 'warning');
          setLoading(false);
          return;
        }
        resp = await sendNotification({ userIds: selectedUserIds, message, type, data });
      }
      showNotification('Notifications sent successfully', 'success');
      setSelectedUserIds([]);
      setMessage('');
      setOfferId('');
    } catch (e) {
      showNotification(e.response?.data?.message || 'Failed to send notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchOffers(); }, []);

  return (
    <div className="container">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-2">Send Notifications</h1>
        <p className="text-gray-600 mb-6">Notify users about available offers and updates</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="mode" checked={mode==='role'} onChange={() => setMode('role')} />
                <span>Send to Role</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mode" checked={mode==='users'} onChange={() => setMode('users')} />
                <span>Send to Selected Users</span>
              </label>
            </div>

            {mode === 'role' ? (
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="select">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input value={userQuery} onChange={e => setUserQuery(e.target.value)} placeholder="Search users by name or email" className="input flex-1" />
                  <button className="btn" onClick={searchUsers}>Search</button>
                </div>
                <div className="border rounded max-h-48 overflow-auto">
                  {users.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No users</div>
                  ) : users.map(u => (
                    <label key={u._id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-xs text-gray-600">{u.email}</p>
                      </div>
                      <input type="checkbox" checked={selectedUserIds.includes(u._id)} onChange={() => handleToggleUser(u._id)} />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="textarea w-full" placeholder="Write the notification message..." />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="select">
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Attach Offer (optional)</label>
              <select value={offerId} onChange={e => setOfferId(e.target.value)} className="select w-full">
                <option value="">— None —</option>
                {offers.map(o => (
                  <option key={o._id} value={o._id}>{o.name} ({o.code})</option>
                ))}
              </select>
            </div>

            <button className="btn btn-success" onClick={handleSend} disabled={loading}>{loading ? 'Sending...' : 'Send Notifications'}</button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded">
              <h3 className="font-medium mb-1">Tips</h3>
              <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                <li>Use concise, action-oriented messages.</li>
                <li>Attach an active discount to promote offers.</li>
                <li>Target a specific role or select users.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendNotifications;


