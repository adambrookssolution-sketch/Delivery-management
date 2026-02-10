import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { shipmentAPI, uploadAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef } from 'react';

const NEXT_STATUS = {
  PENDING: { status: 'PICKED_UP', label: 'Recoger Paquete', color: '#3b82f6', icon: 'hand-left' },
  PICKED_UP: { status: 'IN_TRANSIT', label: 'Iniciar Tránsito', color: '#8b5cf6', icon: 'car' },
  IN_TRANSIT: { status: 'OUT_FOR_DELIVERY', label: 'En Camino', color: '#06b6d4', icon: 'navigate' },
  OUT_FOR_DELIVERY: { status: 'DELIVERED', label: 'Completar Entrega', color: '#10b981', icon: 'checkmark-circle' },
};

export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const cameraRef = useRef(null);

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState('');

  // Delivery completion state
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionStep, setCompletionStep] = useState(0); // 0=photo, 1=code, 2=confirm
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [deliveryCode, setDeliveryCode] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState('back');
  const [flashMode, setFlashMode] = useState('off');

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      const res = await shipmentAPI.getById(id);
      setShipment(res.data.data);
    } catch (error) {
      Alert.alert('Error', 'Error al cargar detalles del envío');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = () => {
    const next = NEXT_STATUS[shipment.status];
    if (!next) return;

    if (next.status === 'DELIVERED') {
      setShowCompletion(true);
      setCompletionStep(0);
      return;
    }

    Alert.alert(
      'Actualizar Estado',
      `Cambiar estado a "${next.label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setActionLoading(true);
            try {
              await shipmentAPI.updateStatus(id, next.status, note || undefined);
              setNote('');
              await fetchShipment();
              Alert.alert('Éxito', 'Estado actualizado');
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Error al actualizar estado');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const openMaps = () => {
    const { recipientLat, recipientLng, recipientAddress } = shipment;
    let url;
    if (recipientLat && recipientLng) {
      url = Platform.select({
        ios: `maps:0,0?q=${recipientLat},${recipientLng}`,
        android: `geo:${recipientLat},${recipientLng}?q=${recipientLat},${recipientLng}`,
        default: `https://maps.google.com/?q=${recipientLat},${recipientLng}`,
      });
    } else {
      url = `https://maps.google.com/?q=${encodeURIComponent(recipientAddress)}`;
    }
    Linking.openURL(url);
  };

  const callRecipient = () => {
    if (shipment.recipientPhone) {
      Linking.openURL(`tel:${shipment.recipientPhone}`);
    }
  };

  // Camera & Delivery Completion
  const takePhoto = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permiso Requerido', 'Se necesita permiso de cámara para tomar fotos de entrega');
        return;
      }
    }
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        setCapturedPhoto(photo.uri);
        setShowCamera(false);
      } catch (error) {
        Alert.alert('Error', 'Error al capturar foto. Intente de nuevo.');
      }
    }
  };

  const uploadPhoto = async () => {
    if (!capturedPhoto) return;
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: capturedPhoto,
        type: 'image/jpeg',
        name: 'delivery-photo.jpg',
      });
      const res = await uploadAPI.photo(formData);
      setPhotoUrl(res.data.data.url);
      setCompletionStep(shipment.deliveryCode ? 1 : 2);
    } catch (error) {
      Alert.alert('Error', 'Error al subir foto');
    } finally {
      setActionLoading(false);
    }
  };

  const completeDelivery = async () => {
    setActionLoading(true);
    try {
      const data = {};
      if (photoUrl) data.photoUrl = photoUrl;
      if (shipment.deliveryCode) data.deliveryCode = deliveryCode;
      if (note) data.note = note;

      await shipmentAPI.deliver(id, data);
      setShowCompletion(false);
      Alert.alert('¡Entrega Completada!', 'La entrega ha sido marcada como completada.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Error al completar entrega');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!shipment) return null;

  const nextAction = NEXT_STATUS[shipment.status];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>

        {/* Status Header */}
        <View style={styles.statusHeader}>
          <StatusBadge status={shipment.status} size="large" />
          <Text style={styles.trackingNumber}>{shipment.trackingNumber}</Text>
        </View>

        {/* Recipient Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={18} color="#10b981" />
            <Text style={styles.cardTitle}>Destinatario</Text>
          </View>
          <Text style={styles.cardName}>{shipment.recipientName}</Text>
          <Text style={styles.cardText}>{shipment.recipientPhone}</Text>
          <Text style={styles.cardText}>{shipment.recipientAddress}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.cardActionBtn} onPress={callRecipient}>
              <Ionicons name="call" size={18} color="#3b82f6" />
              <Text style={styles.cardActionText}>Llamar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardActionBtn} onPress={openMaps}>
              <Ionicons name="navigate" size={18} color="#3b82f6" />
              <Text style={styles.cardActionText}>Navegar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sender Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business" size={18} color="#f59e0b" />
            <Text style={styles.cardTitle}>Remitente</Text>
          </View>
          <Text style={styles.cardName}>{shipment.senderName}</Text>
          <Text style={styles.cardText}>{shipment.senderPhone}</Text>
          <Text style={styles.cardText}>{shipment.senderAddress}</Text>
        </View>

        {/* Package Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube" size={18} color="#8b5cf6" />
            <Text style={styles.cardTitle}>Paquete</Text>
          </View>
          <View style={styles.packageRow}>
            {shipment.packageWeight && (
              <View style={styles.packageItem}>
                <Text style={styles.packageLabel}>Peso</Text>
                <Text style={styles.packageValue}>{shipment.packageWeight} kg</Text>
              </View>
            )}
            {shipment.packageSize && (
              <View style={styles.packageItem}>
                <Text style={styles.packageLabel}>Tamaño</Text>
                <Text style={styles.packageValue}>{shipment.packageSize}</Text>
              </View>
            )}
          </View>
          {shipment.description && (
            <Text style={styles.cardText}>{shipment.description}</Text>
          )}
        </View>

        {/* Status Timeline */}
        {shipment.statusHistory && shipment.statusHistory.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={18} color="#06b6d4" />
              <Text style={styles.cardTitle}>Línea de Tiempo</Text>
            </View>
            {shipment.statusHistory.map((entry, index) => (
              <View key={entry.id} style={styles.timelineItem}>
                <View style={styles.timelineDot}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: index === 0 ? '#3b82f6' : '#64748b' },
                    ]}
                  />
                  {index < shipment.statusHistory.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <StatusBadge status={entry.status} />
                  {entry.note && <Text style={styles.timelineNote}>{entry.note}</Text>}
                  <Text style={styles.timelineDate}>
                    {new Date(entry.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Note Input */}
        {nextAction && (
          <View style={styles.noteContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="Agregar una nota (opcional)"
              placeholderTextColor="#64748b"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Button */}
      {nextAction && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: nextAction.color }]}
            onPress={handleStatusChange}
            disabled={actionLoading}
            activeOpacity={0.8}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name={nextAction.icon} size={22} color="#fff" />
                <Text style={styles.actionButtonText}>{nextAction.label}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Delivery Completion Modal */}
      <Modal visible={showCompletion} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Completar Entrega</Text>
              <TouchableOpacity onPress={() => setShowCompletion(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Step Indicators */}
            <View style={styles.steps}>
              {['Foto', shipment.deliveryCode ? 'Código' : null, 'Confirmar']
                .filter(Boolean)
                .map((step, i) => (
                  <View key={step} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        completionStep >= i && styles.stepCircleActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepNum,
                          completionStep >= i && styles.stepNumActive,
                        ]}
                      >
                        {i + 1}
                      </Text>
                    </View>
                    <Text style={styles.stepLabel}>{step}</Text>
                  </View>
                ))}
            </View>

            {/* Step 0: Photo */}
            {completionStep === 0 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Tomar Foto de Entrega</Text>
                <Text style={styles.stepDesc}>Tome una foto como prueba de entrega</Text>

                {capturedPhoto ? (
                  <View style={styles.photoPreview}>
                    <Text style={styles.photoTaken}>Foto capturada</Text>
                    <View style={styles.photoActions}>
                      <TouchableOpacity
                        style={styles.retakeBtn}
                        onPress={() => setCapturedPhoto(null)}
                      >
                        <Text style={styles.retakeBtnText}>Repetir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.uploadBtn}
                        onPress={uploadPhoto}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.uploadBtnText}>Siguiente</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
                    <Ionicons name="camera" size={32} color="#3b82f6" />
                    <Text style={styles.cameraBtnText}>Abrir Cámara</Text>
                  </TouchableOpacity>
                )}

                {/* Skip photo option */}
                <TouchableOpacity
                  style={styles.skipBtn}
                  onPress={() => setCompletionStep(shipment.deliveryCode ? 1 : 2)}
                >
                  <Text style={styles.skipBtnText}>Saltar foto</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 1: Delivery Code */}
            {completionStep === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Ingresar Código de Entrega</Text>
                <Text style={styles.stepDesc}>
                  Solicite al destinatario el código de entrega de 6 dígitos
                </Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="000000"
                  placeholderTextColor="#64748b"
                  value={deliveryCode}
                  onChangeText={setDeliveryCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                />
                <TouchableOpacity
                  style={[
                    styles.nextBtn,
                    deliveryCode.length !== 6 && styles.nextBtnDisabled,
                  ]}
                  onPress={() => setCompletionStep(2)}
                  disabled={deliveryCode.length !== 6}
                >
                  <Text style={styles.nextBtnText}>Siguiente</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Confirm */}
            {completionStep === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Confirmar Entrega</Text>
                <Text style={styles.stepDesc}>Revise y confirme la entrega</Text>

                <View style={styles.confirmList}>
                  <View style={styles.confirmItem}>
                    <Ionicons name="person" size={16} color="#94a3b8" />
                    <Text style={styles.confirmText}>{shipment.recipientName}</Text>
                  </View>
                  <View style={styles.confirmItem}>
                    <Ionicons name="camera" size={16} color="#94a3b8" />
                    <Text style={styles.confirmText}>
                      {photoUrl ? 'Foto adjunta' : 'Sin foto'}
                    </Text>
                  </View>
                  {shipment.deliveryCode && (
                    <View style={styles.confirmItem}>
                      <Ionicons name="key" size={16} color="#94a3b8" />
                      <Text style={styles.confirmText}>Código: {deliveryCode}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={completeDelivery}
                  disabled={actionLoading}
                  activeOpacity={0.8}
                >
                  {actionLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={22} color="#fff" />
                      <Text style={styles.completeBtnText}>Confirmar Entrega</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing={cameraFacing} flash={flashMode}>
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraTopBar}>
                <TouchableOpacity
                  style={styles.cameraCloseBtn}
                  onPress={() => setShowCamera(false)}
                >
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraToolBtn}
                  onPress={() => setFlashMode(f => f === 'off' ? 'on' : 'off')}
                >
                  <Ionicons name={flashMode === 'on' ? 'flash' : 'flash-off'} size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.cameraBottomBar}>
                <View style={{ width: 44 }} />
                <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto}>
                  <View style={styles.captureBtnInner} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraToolBtn}
                  onPress={() => setCameraFacing(f => f === 'back' ? 'front' : 'back')}
                >
                  <Ionicons name="camera-reverse" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
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
  scrollContent: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  trackingNumber: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 16,
    fontWeight: '600',
    color: '#60a5fa',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59,130,246,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#60a5fa',
  },
  packageRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 8,
  },
  packageItem: {},
  packageLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  packageValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineDot: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#334155',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
    gap: 4,
  },
  timelineNote: {
    fontSize: 13,
    color: '#94a3b8',
  },
  timelineDate: {
    fontSize: 11,
    color: '#64748b',
  },
  noteContainer: {
    marginTop: 8,
  },
  noteInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#f1f5f9',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 50,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 28,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#3b82f6',
  },
  stepNum: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  stepNumActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  stepContent: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  cameraBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(59,130,246,0.3)',
  },
  cameraBtnText: {
    fontSize: 15,
    color: '#60a5fa',
    fontWeight: '500',
  },
  photoPreview: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  photoTaken: {
    fontSize: 15,
    color: '#10b981',
    fontWeight: '500',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retakeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  retakeBtnText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  uploadBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  uploadBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  skipBtn: {
    marginTop: 16,
    padding: 8,
  },
  skipBtnText: {
    fontSize: 13,
    color: '#64748b',
  },
  codeInput: {
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    fontSize: 32,
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  nextBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmList: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
  },
  confirmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  confirmText: {
    fontSize: 14,
    color: '#f1f5f9',
  },
  completeBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#10b981',
  },
  completeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Camera
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 56,
  },
  cameraTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  cameraCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraToolBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
});
