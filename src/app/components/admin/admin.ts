import { Component } from '@angular/core';
import {CommonModule, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeederService } from '../../services/seeder.service';
import { FirebaseHistoryService } from '../../services/firebase-history.service';

@Component({
  selector: 'app-admin',
  imports: [
    NgIf,
    FormsModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})

export class Admin {
  seedCount = 50;
  loading = false;
  message = '';
  error = false;
  stats: any = null;

  constructor(
    private seeder: SeederService,
    private firebaseHistory: FirebaseHistoryService
  ) {
    this.loadStats();
  }

  async seed() {
    this.loading = true;
    this.message = '';
    this.error = false;

    try {
      await this.seeder.seedDatabase(this.seedCount);
      this.message = `${this.seedCount} entrées générées avec succès !`;
      this.error = false;
      this.loadStats();
    } catch (err) {
      this.message = ' Erreur lors de la génération des données';
      this.error = true;
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async clear() {
    if (!confirm(' Voulez-vous vraiment supprimer TOUTES les données ?')) {
      return;
    }

    this.loading = true;
    this.message = '';

    try {
      await this.seeder.clearDatabase();
      this.message = 'Base de données nettoyée !';
      this.error = false;
      this.loadStats();
    } catch (err) {
      this.message = 'Erreur lors de la suppression';
      this.error = true;
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  loadStats() {
    this.firebaseHistory.getHistory().subscribe({
      next: (entries) => {
        this.stats = {
          total: entries.length,
          healthy: entries.filter(e => e.consensus === 'Healthy').length,
          atRisk: entries.filter(e => e.consensus === 'At Risk').length
        };
      },
      error: (err) => {
        console.error('Erreur chargement stats:', err);
      }
    });
  }
}
