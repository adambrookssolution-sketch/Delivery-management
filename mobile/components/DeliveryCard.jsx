import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';

export default function DeliveryCard({ shipment, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.tracking}>{shipment.trackingNumber || 'N/A'}</Text>
        <StatusBadge status={shipment.status} />
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={16} color="#94a3b8" />
          <Text style={styles.infoText}>{shipment.recipientName || 'Desconocido'}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color="#94a3b8" />
          <Text style={styles.infoText} numberOfLines={1}>
            {shipment.recipientAddress || 'Sin dirección'}
          </Text>
        </View>
        {shipment.packageSize && (
          <View style={styles.row}>
            <Ionicons name="cube-outline" size={16} color="#94a3b8" />
            <Text style={styles.infoText}>
              {shipment.packageSize}
              {shipment.packageWeight ? ` · ${shipment.packageWeight}kg` : ''}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tracking: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '600',
    color: '#60a5fa',
  },
  info: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#94a3b8',
    flex: 1,
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
});
