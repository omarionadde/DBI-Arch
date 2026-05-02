import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { InvestmentRecord } from '../types';
import { createAuditLog } from './auditService';

export async function registerInvestment(
  data: Omit<InvestmentRecord, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string,
  userName: string
) {
  const docRef = await addDoc(collection(db, 'investments'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    action: 'CREATE',
    userId,
    userName,
    documentId: docRef.id,
    documentTitle: data.fullName,
    details: `Registered investment for: ${data.fullName} (${data.accountNo})`
  });

  return docRef.id;
}

export async function getRecentInvestments(max = 5) {
  const q = query(
    collection(db, 'investments'),
    orderBy('createdAt', 'desc'),
    limit(max)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvestmentRecord));
}

export async function getStats() {
  const coll = collection(db, 'investments');
  const snapshot = await getCountFromServer(coll);
  return {
    total: snapshot.data().count,
  };
}

export async function getAllInvestments(filters?: { 
  status?: string,
  search?: string 
}) {
  let q = query(collection(db, 'investments'), orderBy('createdAt', 'desc'));

  if (filters?.status) q = query(q, where('status', '==', filters.status));

  const snapshot = await getDocs(q);
  let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvestmentRecord));

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    docs = docs.filter(d => 
      d.fullName.toLowerCase().includes(search) || 
      d.accountNo.toLowerCase().includes(search) ||
      d.serialNo.toLowerCase().includes(search)
    );
  }

  return docs;
}

export async function deleteInvestment(investId: string, userId: string, userName: string, fullName: string) {
  await deleteDoc(doc(db, 'investments', investId));
  
  await createAuditLog({
    action: 'DELETE',
    userId,
    userName,
    documentId: investId,
    documentTitle: fullName,
    details: `Deleted investment record for: ${fullName}`
  });
}
