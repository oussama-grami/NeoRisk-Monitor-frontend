import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  CollectionReference,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { HistoryEntry } from '../models/history.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseHistoryService {
  private firestore = inject(Firestore);
  private historyCollection: CollectionReference<DocumentData>;

  constructor() {
    // Collection "predictions" dans Firestore
    this.historyCollection = collection(this.firestore, 'predictions');
  }

  /**
   * Récupérer tout l'historique
   */
  getHistory(): Observable<HistoryEntry[]> {
    // Créer une requête avec tri par date (plus récent d'abord)
    const q = query(this.historyCollection, orderBy('timestamp', 'desc'));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const entries: HistoryEntry[] = [];

        snapshot.forEach(doc => {
          const data = doc.data();

          // Convertir Timestamp Firebase en Date JavaScript
          const timestamp = data['timestamp'] instanceof Timestamp
            ? data['timestamp'].toDate()
            : new Date(data['timestamp']);

          entries.push({
            id: doc.id,
            timestamp: timestamp,
            babyName: data['babyName'],
            babyGender: data['babyGender'],
            babyAge: data['babyAge'],
            modelsUsed: data['modelsUsed'] || [],
            consensus: data['consensus'],
            consensusConfidence: data['consensusConfidence'],
            healthyCount: data['healthyCount'],
            atRiskCount: data['atRiskCount'],
            avgResponseTime: data['avgResponseTime'],
            riskFactorsCount: data['riskFactorsCount'] || 0,
            notes: data['notes']
          });
        });

        return entries;
      })
    );
  }

  /**
   * Ajouter une entrée à l'historique
   */
  addEntry(entry: Omit<HistoryEntry, 'id'>): Observable<string> {
    // Préparer les données pour Firestore
    const data = {
      timestamp: Timestamp.fromDate(entry.timestamp),
      babyName: entry.babyName || null,
      babyGender: entry.babyGender,
      babyAge: entry.babyAge,
      modelsUsed: entry.modelsUsed,
      consensus: entry.consensus,
      consensusConfidence: entry.consensusConfidence,
      healthyCount: entry.healthyCount,
      atRiskCount: entry.atRiskCount,
      avgResponseTime: entry.avgResponseTime,
      riskFactorsCount: entry.riskFactorsCount || 0,
      notes: entry.notes || null
    };

    return from(addDoc(this.historyCollection, data)).pipe(
      map(docRef => docRef.id)
    );
  }

  /**
   * Supprimer une entrée
   */
  deleteEntry(id: string): Observable<void> {
    const docRef = doc(this.firestore, 'predictions', id);
    return from(deleteDoc(docRef));
  }

  /**
   * Supprimer toutes les entrées (utile pour reset)
   */
  async clearAllHistory(): Promise<void> {
    const snapshot = await getDocs(this.historyCollection);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
}
