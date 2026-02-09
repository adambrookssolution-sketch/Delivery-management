import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { shipmentAPI } from '../../services/api';
import DeliveryCard from '../../components/DeliveryCard';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await shipmentAPI.getMyShipments();
      setShipments(res.data.data || []);
    } catch (error) {
      if (error.message === 'Network Error') {
        Alert.alert('No Connection', 'Please check your internet connection and try again.');
      }
      console.error('Failed to load shipments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const stats = {
    total: shipments.length,
    pending: shipments.filter((s) => ['PENDING', 'PICKED_UP'].includes(s.status)).length,
    inDelivery: shipments.filter((s) => ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)).length,
    delivered: shipments.filter((s) => s.status === 'DELIVERED').length,
  };

  const recentShipments = shipments
    .filter((s) => s.status !== 'DELIVERED')
    .slice(0, 5);

  const statCards = [
    { label: 'Total', value: stats.total, icon: 'cube', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    { label: 'Pending', value: stats.pending, icon: 'time', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { label: 'In Delivery', value: stats.inDelivery, icon: 'car', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    { label: 'Delivered', value: stats.delivered, icon: 'checkmark-circle', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'Driver'}</Text>
          <Text style={styles.subtitle}>Here's your delivery overview</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name && user.name[0]) || 'D'}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map((card) => (
          <View key={card.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: card.bg }]}>
              <Ionicons name={card.icon} size={22} color={card.color} />
            </View>
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <TouchableOpacity
        style={styles.quickAction}
        onPress={() => router.push('/(tabs)/deliveries')}
        activeOpacity={0.7}
      >
        <Ionicons name="list" size={20} color="#3b82f6" />
        <Text style={styles.quickActionText}>View All Deliveries</Text>
        <Ionicons name="chevron-forward" size={18} color="#64748b" />
      </TouchableOpacity>

      {/* Recent Active Deliveries */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Deliveries</Text>
        {recentShipments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done" size={48} color="#64748b" />
            <Text style={styles.emptyText}>No active deliveries</Text>
          </View>
        ) : (
          recentShipments.map((shipment) => (
            <DeliveryCard
              key={shipment.id}
              shipment={shipment}
              onPress={() => router.push(`/delivery/${shipment.id}`)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexGrow: 1,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  statLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  quickActionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#f1f5f9',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
});
