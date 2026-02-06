import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { shipmentAPI } from '../../services/api';
import DeliveryCard from '../../components/DeliveryCard';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function DeliveriesScreen() {
  const router = useRouter();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchShipments = async () => {
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
      fetchShipments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchShipments();
  };

  const filteredShipments = shipments.filter((s) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PENDING') return ['PENDING', 'PICKED_UP'].includes(s.status);
    if (activeFilter === 'ACTIVE') return ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status);
    if (activeFilter === 'DELIVERED') return s.status === 'DELIVERED';
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Deliveries</Text>
        <Text style={styles.count}>{filteredShipments.length} shipments</Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterBtn,
              activeFilter === filter.key && styles.filterBtnActive,
            ]}
            onPress={() => setActiveFilter(filter.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredShipments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DeliveryCard
            shipment={item}
            onPress={() => router.push(`/delivery/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={56} color="#64748b" />
            <Text style={styles.emptyTitle}>No Deliveries</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'ALL'
                ? 'No shipments assigned to you yet'
                : `No ${FILTERS.find((f) => f.key === activeFilter)?.label.toLowerCase()} deliveries`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  count: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderColor: 'rgba(59,130,246,0.4)',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
  },
  filterTextActive: {
    color: '#60a5fa',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
