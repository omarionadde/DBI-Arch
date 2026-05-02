import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AuditLogEntry } from '../types';

export async function createAuditLog(log: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  try {
    await addDoc(collection(db, 'logs'), {
      ...log,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to create audit log', error);
  }
}

export async function getAuditLogs(max = 50) {
  const q = query(
    collection(db, 'logs'),
    orderBy('timestamp', 'desc'),
    limit(max)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLogEntry));
}
