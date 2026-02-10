import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

const QUEUE_KEY = 'offline_request_queue';

async function getQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveQueue(queue) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

async function enqueue(requestConfig) {
  const entry = {
    id: Date.now().toString(),
    method: requestConfig.method,
    url: requestConfig.url,
    baseURL: requestConfig.baseURL,
    data: requestConfig.data,
    timestamp: new Date().toISOString(),
  };
  const queue = await getQueue();
  queue.push(entry);
  await saveQueue(queue);
  return entry;
}

async function dequeue(id) {
  const queue = await getQueue();
  const updated = queue.filter(item => item.id !== id);
  await saveQueue(updated);
}

let isProcessing = false;

async function processQueue(apiInstance) {
  if (isProcessing) return;

  const queue = await getQueue();
  if (queue.length === 0) return;

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  isProcessing = true;
  let successCount = 0;
  let failCount = 0;

  for (const entry of queue) {
    try {
      await apiInstance({
        method: entry.method,
        url: entry.url,
        data: entry.data,
      });
      await dequeue(entry.id);
      successCount++;
    } catch (error) {
      if (error.message === 'Network Error') break;
      await dequeue(entry.id);
      failCount++;
    }
  }

  isProcessing = false;

  if (successCount > 0) {
    Alert.alert(
      'Cola Procesada',
      `Se enviaron ${successCount} solicitud(es) pendiente(s).${failCount > 0 ? ` ${failCount} fallaron.` : ''}`
    );
  }
}

let unsubscribe = null;

function startListening(apiInstance) {
  if (unsubscribe) return;

  unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      processQueue(apiInstance);
    }
  });
}

function stopListening() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

export { enqueue, getQueue, processQueue, startListening, stopListening };
