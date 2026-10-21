import React, { useState, useEffect } from 'react';
import { 
  getProviderPatients, 
  getDashboardStats,
  getPatientsByAdherence,
  getPatientsSorted,
  getProviderNotifications,
  searchPatients
} from '../../utils/providerDashboard';
import PatientListView from './PatientListView';
import AlertNotifications from './AlertNotifications';

/**
 * ProviderMainDashboard
 * Main provider interface showing patient list, metrics, and alerts
 */
export default function ProviderMainDashboard() {
  // State
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, high-risk, alerts
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterAdherence, setFilterAdherence] = useState('all'); // all, excellent, good, fair, poor
  const [expandedNotificationId, setExpandedNotificationId] = useState(null);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter and sort patients when data or filters change
  useEffect(() => {
    applyFiltersAndSort();
  }, [patients, activeTab, searchTerm, sortBy, filterAdherence]);

  /**
   * Load dashboard data
   */
  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);

      // Simulated provider ID (in production, get from auth)
      const providerId = 'provider-123';

      // Load all data in parallel
      const [patientsData, statsData, notificationsData] = await Promise.all([
        getProviderPatients(providerId),
        getDashboardStats(providerId),
        getProviderNotifications(providerId)
      ]);

      setPatients(patientsData);
      setStats(statsData);
      setNotifications(notificationsData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Apply filters and sorting
   */
  async function applyFiltersAndSort() {
    try {
      let filtered = [...patients];

      // Apply search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(term) ||
          p.id.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term)
        );
      }

      // Apply tab filter
      if (activeTab === 'high-risk') {
        filtered = filtered.filter(p => p.riskScore > 0.5);
      } else if (activeTab === 'alerts') {
        filtered = filtered.filter(p => p.alerts.length > 0);
      }

      // Apply adherence filter
      if (filterAdherence !== 'all') {
        const ranges = {
          'excellent': { min: 90, max: 100 },
          'good': { min: 75, max: 89 },
          'fair': { min: 60, max: 74 },
          'poor': { min: 0, max: 59 }
        };
        const range = ranges[filterAdherence];
        filtered = filtered.filter(p => 
          p.adherenceRate >= range.min && p.adherenceRate <= range.max
        );
      }

      // Apply sorting
      const sortComparators = {
        'name': (a, b) => a.name.localeCompare(b.name),
        'adherence': (a, b) => b.adherenceRate - a.adherenceRate,
        'risk': (a, b) => b.riskScore - a.riskScore,
        'alerts': (a, b) => b.alerts.length - a.alerts.length
      };

      const comparator = sortComparators[sortBy];
      if (comparator) {
        filtered.sort(comparator);
      }

      setFilteredPatients(filtered);
    } catch (err) {
      console.error('Filter/sort error:', err);
    }
  }

  /**
   * Handle search
   */
  function handleSearch(e) {
    setSearchTerm(e.target.value);
  }

  /**
   * Handle tab change
   */
  function handleTabChange(tab) {
    setActiveTab(tab);
  }

  /**
   * Handle sort change
   */
  function handleSortChange(e) {
    setSortBy(e.target.value);
  }

  /**
   * Handle adherence filter change
   */
  function handleAdherenceFilterChange(e) {
    setFilterAdherence(e.target.value);
  }

  /**
   * Handle refresh
   */
  function handleRefresh() {
    loadDashboardData();
  }

  // Loading state
  if (loading && !patients.length) {
    return (
      <div className="provider-dashboard loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error && !patients.length) {
    return (
      <div className="provider-dashboard error">
        <div className="error-message">
          <h2>⚠️ Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Provider Dashboard</h1>
          <p className="header-subtitle">Patient adherence and care management</p>
        </div>
        <button onClick={handleRefresh} className="refresh-btn" title="Refresh data">
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalPatients}</div>
              <div className="stat-label">Total Patients</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.activeAlerts}</div>
              <div className="stat-label">Active Alerts</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚨</div>
            <div className="stat-content">
              <div className="stat-value">{stats.highRiskPatients}</div>
              <div className="stat-label">High Risk</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.averageAdherence}%</div>
              <div className="stat-label">Avg Adherence</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.appointmentsThisWeek}</div>
              <div className="stat-label">Appointments (7d)</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.criticalAlerts}</div>
              <div className="stat-label">Critical Alerts</div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {notifications.length > 0 && (
        <AlertNotifications 
          notifications={notifications}
          expandedId={expandedNotificationId}
          onToggleExpand={setExpandedNotificationId}
        />
      )}

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Sidebar Filters */}
        <div className="dashboard-sidebar">
          <div className="filter-section">
            <h3>Filters</h3>
            
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <input
                type="text"
                placeholder="Search by name, ID, email..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Adherence Level</label>
              <select
                value={filterAdherence}
                onChange={handleAdherenceFilterChange}
                className="filter-select"
              >
                <option value="all">All Levels</option>
                <option value="excellent">Excellent (90-100%)</option>
                <option value="good">Good (75-89%)</option>
                <option value="fair">Fair (60-74%)</option>
                <option value="poor">Poor (0-59%)</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="filter-select"
              >
                <option value="name">Name (A-Z)</option>
                <option value="adherence">Adherence (High→Low)</option>
                <option value="risk">Risk Score (High→Low)</option>
                <option value="alerts">Alerts (Most First)</option>
              </select>
            </div>
          </div>

          {/* View Options */}
          <div className="filter-section">
            <h3>Views</h3>
            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => handleTabChange('all')}
              >
                All Patients
                <span className="count">{patients.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'high-risk' ? 'active' : ''}`}
                onClick={() => handleTabChange('high-risk')}
              >
                High Risk
                <span className="count">
                  {patients.filter(p => p.riskScore > 0.5).length}
                </span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                onClick={() => handleTabChange('alerts')}
              >
                With Alerts
                <span className="count">
                  {patients.filter(p => p.alerts.length > 0).length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="dashboard-content">
          <div className="content-header">
            <h2>
              {activeTab === 'all' && 'All Patients'}
              {activeTab === 'high-risk' && 'High Risk Patients'}
              {activeTab === 'alerts' && 'Patients with Alerts'}
            </h2>
            <span className="result-count">
              {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredPatients.length > 0 ? (
            <PatientListView patients={filteredPatients} />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No patients found</h3>
              <p>
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'No patients match the selected filters'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
