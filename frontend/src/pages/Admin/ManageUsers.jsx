import React, { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch.js';
import { getAllUsers, toggleUserStatus } from '../../services/adminService.js';

const StatusBadge = ({ isActive }) => (
  <span className={`statusBadge ${isActive ? 'active' : 'inactive'}`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const PlanBadge = ({ plan }) => (
  plan ? (
    <div className="inline-flex items-center gap-2">
      <span className="font-medium">{plan.name}</span>
      <span className="planType">{plan.productType}</span>
      <span className="text-sm text-gray-600">${plan.price} / {plan.billingCycle}</span>
    </div>
  ) : (
    <span className="text-gray-500">No active plan</span>
  )
);

const ManageUsers = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, loading, error, refetch } = useFetch(
    () => getAllUsers({ page, limit, search: query, sortBy: 'createdAt', sortOrder: 'desc' }),
    [page, limit, query]
  );

  const users = data?.data?.users || data?.users || [];
  const pagination = data?.data?.pagination || data?.pagination || { current: 1, pages: 1, total: 0, limit: 10 };

  const handleToggleStatus = async (id) => {
    try {
      await toggleUserStatus(id);
      refetch();
    } catch (e) {
      // handled by interceptor/UI
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Manage Users</h1>
            <p className="text-gray-600">View all users with their subscription details</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by name or email"
              value={query}
              onChange={(e) => { setPage(1); setQuery(e.target.value); }}
              className="input"
            />
            <select value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }} className="select">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {pagination.total} users • Page {pagination.current} of {pagination.pages}
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div>Loading users...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : users.length === 0 ? (
          <div className="emptyState">
            <div className="emptyStateIcon">👥</div>
            <h3 className="emptyStateTitle">No Users Found</h3>
            <p className="emptyStateDescription">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="tableContainer">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Active Subscription</th>
                  <th>Subs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </td>
                    <td>
                      <span className="planType">{user.role}</span>
                    </td>
                    <td>
                      <StatusBadge isActive={user.isActive} />
                    </td>
                    <td>
                      <div className="space-y-1">
                        <PlanBadge plan={user.activeSubscription?.plan} />
                        {user.activeSubscription && (
                          <div className="text-xs text-gray-600">
                            <span>Ends: {new Date(user.activeSubscription.endDate).toLocaleDateString()}</span>
                            {user.activeSubscription.isExpiringSoon && (
                              <span className="ml-2 text-amber-600">Expiring soon ({user.activeSubscription.daysRemaining}d)</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <span className="mr-2">Total: {user.subscriptionCount || 0}</span>
                        <span>Active: {user.activeSubscriptionCount || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-outline" onClick={() => handleToggleStatus(user._id)}>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <button className="btn" disabled={pagination.current <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
          <div className="text-sm text-gray-600">Page {pagination.current} of {pagination.pages}</div>
          <button className="btn" disabled={pagination.current >= pagination.pages} onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;


