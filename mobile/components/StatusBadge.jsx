import { View, Text, StyleSheet } from 'react-native';

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  PICKED_UP: { label: 'Recogido', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  IN_TRANSIT: { label: 'En Tránsito', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  OUT_FOR_DELIVERY: { label: 'En Camino', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  DELIVERED: { label: 'Entregado', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  FAILED: { label: 'Fallido', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  RETURNED: { label: 'Devuelto', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

export default function StatusBadge({ status, size = 'small' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.color + '40',
          paddingHorizontal: isLarge ? 16 : 10,
          paddingVertical: isLarge ? 8 : 4,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text
        style={[
          styles.text,
          { color: config.color, fontSize: isLarge ? 14 : 11 },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '600',
  },
});
