import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface MarkupRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  conditions: {
    route?: string;
    airline?: string;
    bookingClass?: string;
    region?: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  totalMarkup: number;
  averageMarkup: number;
  topRoutes: Array<{ route: string; bookings: number; revenue: number }>;
  revenueGrowth: number;
}

export const AdminDashboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'markup' | 'analytics' | 'users'>('overview');
  const [showMarkupModal, setShowMarkupModal] = useState(false);
  const [markupRules, setMarkupRules] = useState<MarkupRule[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    conditions: {},
  });

  // Mock data initialization
  useEffect(() => {
    // Initialize mock markup rules
    setMarkupRules([
      {
        id: '1',
        name: 'Europe Routes Premium',
        type: 'percentage',
        value: 5.5,
        conditions: { region: 'Europe', bookingClass: 'Business' },
        isActive: true,
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        name: 'Domestic Economy',
        type: 'percentage',
        value: 3.0,
        conditions: { region: 'Domestic', bookingClass: 'Economy' },
        isActive: true,
        createdAt: '2024-01-10',
      },
      {
        id: '3',
        name: 'Emirates Flights',
        type: 'fixed',
        value: 25,
        conditions: { airline: 'Emirates' },
        isActive: false,
        createdAt: '2024-01-05',
      },
    ]);

    // Initialize mock analytics
    setAnalytics({
      totalBookings: 1247,
      totalRevenue: 892450,
      totalMarkup: 43622,
      averageMarkup: 4.9,
      topRoutes: [
        { route: 'DXB → LHR', bookings: 156, revenue: 234800 },
        { route: 'RUH → CDG', bookings: 134, revenue: 201600 },
        { route: 'JED → FRA', bookings: 98, revenue: 147000 },
      ],
      revenueGrowth: 12.5,
    });
  }, []);

  const handleAddMarkupRule = () => {
    if (!newRule.name || newRule.value <= 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const rule: MarkupRule = {
      id: Date.now().toString(),
      ...newRule,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setMarkupRules([...markupRules, rule]);
    setNewRule({ name: '', type: 'percentage', value: 0, conditions: {} });
    setShowMarkupModal(false);
    Alert.alert('Success', 'Markup rule added successfully');
  };

  const toggleRuleStatus = (id: string) => {
    setMarkupRules(rules =>
      rules.map(rule =>
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const StatCard: React.FC<{ title: string; value: string; change?: string; icon: string; color: string }> = 
    ({ title, value, change, icon, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {change && (
          <View style={styles.statChange}>
            <Ionicons 
              name={parseFloat(change) >= 0 ? "trending-up" : "trending-down"} 
              size={16} 
              color={parseFloat(change) >= 0 ? "#10B981" : "#EF4444"} 
            />
            <Text style={[
              styles.statChangeText,
              { color: parseFloat(change) >= 0 ? "#10B981" : "#EF4444" }
            ]}>
              {change}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Bookings"
          value={analytics?.totalBookings.toLocaleString() || '0'}
          change="+12.5"
          icon="airplane"
          color="#3B82F6"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(analytics?.totalRevenue || 0).toLocaleString()}`}
          change="+8.3"
          icon="trending-up"
          color="#10B981"
        />
        <StatCard
          title="Markup Revenue"
          value={`$${(analytics?.totalMarkup || 0).toLocaleString()}`}
          change="+15.2"
          icon="cash"
          color="#F59E0B"
        />
        <StatCard
          title="Avg. Markup"
          value={`${analytics?.averageMarkup || 0}%`}
          icon="analytics"
          color="#8B5CF6"
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {[
            { action: 'New booking created', user: 'user@example.com', time: '2 min ago', icon: 'add-circle' },
            { action: 'Markup rule updated', user: 'Admin', time: '15 min ago', icon: 'settings' },
            { action: 'Payment processed', user: 'system', time: '1 hour ago', icon: 'card' },
          ].map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name={activity.icon as any} size={20} color="#6B7280" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityDetails}>{activity.user} • {activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Top Routes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Performing Routes</Text>
        <View style={styles.routesList}>
          {analytics?.topRoutes.map((route, index) => (
            <View key={index} style={styles.routeItem}>
              <View style={styles.routeRank}>
                <Text style={styles.routeRankText}>{index + 1}</Text>
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.route}</Text>
                <Text style={styles.routeStats}>
                  {route.bookings} bookings • ${route.revenue.toLocaleString()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderMarkupManagement = () => (
    <ScrollView style={styles.tabContent}>
      {/* Header with Add Button */}
      <View style={styles.markupHeader}>
        <View>
          <Text style={styles.sectionTitle}>Markup Rules</Text>
          <Text style={styles.sectionSubtitle}>
            Manage pricing rules based on Duffel's markup capabilities
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowMarkupModal(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Rule</Text>
        </TouchableOpacity>
      </View>

      {/* Markup Rules List */}
      <View style={styles.rulesList}>
        {markupRules.map((rule) => (
          <View key={rule.id} style={styles.ruleItem}>
            <View style={styles.ruleHeader}>
              <View style={styles.ruleInfo}>
                <Text style={styles.ruleName}>{rule.name}</Text>
                <Text style={styles.ruleValue}>
                  {rule.type === 'percentage' ? `${rule.value}%` : `$${rule.value}`}
                </Text>
              </View>
              <Switch
                value={rule.isActive}
                onValueChange={() => toggleRuleStatus(rule.id)}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor={rule.isActive ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            <View style={styles.ruleConditions}>
              {Object.entries(rule.conditions).map(([key, value]) => (
                <View key={key} style={styles.conditionTag}>
                  <Text style={styles.conditionText}>{key}: {value}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.ruleDate}>Created: {rule.createdAt}</Text>
          </View>
        ))}
      </View>

      {/* Markup Calculator */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Markup Calculator</Text>
        <Text style={styles.sectionSubtitle}>
          Calculate final customer price including Duffel fees
        </Text>
        <View style={styles.calculatorCard}>
          <View style={styles.calculatorRow}>
            <Text style={styles.calculatorLabel}>Base Price (€)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="120.00"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.calculatorRow}>
            <Text style={styles.calculatorLabel}>Markup (€)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="1.00"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.calculatorRow}>
            <Text style={styles.calculatorLabel}>FX Rate (EUR → GBP)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="0.85"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.calculatorResult}>
            <Text style={styles.calculatorResultLabel}>Final Price (GBP)</Text>
            <Text style={styles.calculatorResultValue}>£105.92</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderAnalytics = () => (
    <ScrollView style={styles.tabContent}>
      {/* Revenue Analytics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue Analytics</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Monthly Revenue</Text>
            <Text style={styles.analyticsValue}>$234,567</Text>
            <Text style={styles.analyticsGrowth}>+12.5% from last month</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Markup Contribution</Text>
            <Text style={styles.analyticsValue}>18.2%</Text>
            <Text style={styles.analyticsGrowth}>+2.1% from last month</Text>
          </View>
        </View>
      </View>

      {/* Booking Trends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking Trends</Text>
        <View style={styles.trendsList}>
          {[
            { period: 'This Week', bookings: 89, change: '+15%' },
            { period: 'This Month', bookings: 347, change: '+8%' },
            { period: 'This Quarter', bookings: 1247, change: '+23%' },
          ].map((trend, index) => (
            <View key={index} style={styles.trendItem}>
              <Text style={styles.trendPeriod}>{trend.period}</Text>
              <View style={styles.trendStats}>
                <Text style={styles.trendBookings}>{trend.bookings} bookings</Text>
                <Text style={styles.trendChange}>{trend.change}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsList}>
          {[
            { label: 'Conversion Rate', value: '3.2%', icon: 'trending-up' },
            { label: 'Average Booking Value', value: '$716', icon: 'cash' },
            { label: 'Customer Satisfaction', value: '4.8/5', icon: 'star' },
            { label: 'Response Time', value: '1.2s', icon: 'time' },
          ].map((metric, index) => (
            <View key={index} style={styles.metricItem}>
              <Ionicons name={metric.icon as any} size={24} color="#6B7280" />
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>RawhahBooking Management</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={32} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: 'Overview', icon: 'grid' },
          { key: 'markup', label: 'Markup', icon: 'pricetag' },
          { key: 'analytics', label: 'Analytics', icon: 'analytics' },
          { key: 'users', label: 'Users', icon: 'people' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? '#DC2626' : '#6B7280'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'markup' && renderMarkupManagement()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'users' && (
        <View style={styles.comingSoon}>
          <Ionicons name="construct" size={64} color="#9CA3AF" />
          <Text style={styles.comingSoonText}>User Management</Text>
          <Text style={styles.comingSoonSubtext}>Coming Soon</Text>
        </View>
      )}

      {/* Add Markup Rule Modal */}
      <Modal
        visible={showMarkupModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMarkupModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Markup Rule</Text>
            <TouchableOpacity onPress={handleAddMarkupRule}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Rule Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Europe Premium Routes"
                value={newRule.name}
                onChangeText={(text) => setNewRule({...newRule, name: text})}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Markup Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newRule.type === 'percentage' && styles.typeOptionSelected
                  ]}
                  onPress={() => setNewRule({...newRule, type: 'percentage'})}
                >
                  <Text style={[
                    styles.typeOptionText,
                    newRule.type === 'percentage' && styles.typeOptionTextSelected
                  ]}>
                    Percentage (%)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newRule.type === 'fixed' && styles.typeOptionSelected
                  ]}
                  onPress={() => setNewRule({...newRule, type: 'fixed'})}
                >
                  <Text style={[
                    styles.typeOptionText,
                    newRule.type === 'fixed' && styles.typeOptionTextSelected
                  ]}>
                    Fixed Amount ($)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {newRule.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
              </Text>
              <TextInput
                style={styles.formInput}
                placeholder={newRule.type === 'percentage' ? '5.0' : '25.00'}
                keyboardType="decimal-pad"
                value={newRule.value.toString()}
                onChangeText={(text) => setNewRule({...newRule, value: parseFloat(text) || 0})}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  profileButton: {
    padding: 8,
  },
  
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  
  // Tab Content
  tabContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  statCard: {
    width: (width - 56) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Sections
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  
  // Activity
  activityList: {
    marginTop: 16,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  activityDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  
  // Routes
  routesList: {
    marginTop: 16,
    gap: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  routeStats: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  
  // Markup Management
  markupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rulesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  ruleItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  ruleValue: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 2,
  },
  ruleConditions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  conditionTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  conditionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  ruleDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  
  // Calculator
  calculatorCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  calculatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calculatorLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  calculatorInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 100,
    textAlign: 'right',
  },
  calculatorResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  calculatorResultLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  calculatorResultValue: {
    fontSize: 18,
    color: '#DC2626',
    fontWeight: '700',
  },
  
  // Analytics
  analyticsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  analyticsTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  analyticsGrowth: {
    fontSize: 12,
    color: '#10B981',
  },
  
  // Trends
  trendsList: {
    marginTop: 16,
    gap: 12,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  trendPeriod: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  trendStats: {
    alignItems: 'flex-end',
  },
  trendBookings: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  trendChange: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 2,
  },
  
  // Metrics
  metricsList: {
    marginTop: 16,
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  metricValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  
  // Coming Soon
  comingSoon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalSave: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    alignItems: 'center',
  },
  typeOptionSelected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeOptionTextSelected: {
    color: '#DC2626',
    fontWeight: '600',
  },
}); 