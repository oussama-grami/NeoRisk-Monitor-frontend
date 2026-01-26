import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseHistoryService } from '../../services/firebase-history.service';
import {
  HistoryEntry,
  HistoryFilters,
  HistoryStats,
  HistorySortCriterion,
  DEFAULT_FILTERS,
  createMockHistoryEntries,
  filterEntries,
  sortEntries,
  calculateHistoryStats,
  exportToJSON,
  exportToCSV
} from '../../models/history.model';
import { MODEL_CONFIG, MLModel } from '../../models/baby-health.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class History implements OnInit {
  // Données
  allEntries: HistoryEntry[] = [];
  filteredEntries: HistoryEntry[] = [];
  displayedEntries: HistoryEntry[] = [];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Filtres
  filters: HistoryFilters = { ...DEFAULT_FILTERS };

  // Statistiques
  stats: HistoryStats | null = null;

  // État
  selectedEntry: HistoryEntry | null = null;
  viewMode: 'list' | 'grid' = 'list';

  // Options de modèles pour le filtre
  modelOptions = [
    { value: 'All', label: 'Tous les modèles' },
    { value: MLModel.DECISION_TREE, label: MODEL_CONFIG[MLModel.DECISION_TREE].displayName },
    { value: MLModel.NAIVE_BAYES, label: MODEL_CONFIG[MLModel.NAIVE_BAYES].displayName },
    { value: MLModel.RANDOM_FOREST, label: MODEL_CONFIG[MLModel.RANDOM_FOREST].displayName },
    { value: MLModel.KNN, label: MODEL_CONFIG[MLModel.KNN].displayName }
  ];

  constructor(
    private router: Router,
    private firebaseHistory: FirebaseHistoryService
  ) {
    router = inject(Router);
    firebaseHistory = inject(FirebaseHistoryService);
  }

  ngOnInit() {
    this.loadHistory();
  }

  // Charger l'historique depuis Firebase
  loadHistory() {
    this.firebaseHistory.getHistory().subscribe({
      next: (entries) => {
        this.allEntries = entries;
        this.applyFilters();
        this.calculateStats();
        console.log('✅ Historique chargé depuis Firebase:', entries.length, 'entrées');
      },
      error: (error) => {
        console.error('❌ Erreur chargement Firebase:', error);
        // Fallback: données mock en cas d'erreur
        this.allEntries = createMockHistoryEntries();
        this.applyFilters();
        this.calculateStats();
      }
    });
  }

  // Appliquer les filtres
  applyFilters() {
    this.filteredEntries = filterEntries(this.allEntries, this.filters);
    this.filteredEntries = sortEntries(
      this.filteredEntries,
      this.filters.sortBy,
      this.filters.sortOrder
    );
    this.updatePagination();
  }

  // Mettre à jour la pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredEntries.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.updateDisplayedEntries();
  }

  // Mettre à jour les entrées affichées
  updateDisplayedEntries() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedEntries = this.filteredEntries.slice(startIndex, endIndex);
  }

  // Calculer les statistiques
  calculateStats() {
    this.stats = calculateHistoryStats(this.allEntries);
  }

  // Changer de page
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedEntries();
    }
  }

  // Changer le nombre d'éléments par page
  changeItemsPerPage(items: number) {
    this.itemsPerPage = items;
    this.currentPage = 1;
    this.updatePagination();
  }

  // Changer le critère de tri
  changeSortCriterion(criterion: HistorySortCriterion) {
    if (this.filters.sortBy === criterion) {
      this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = criterion;
      this.filters.sortOrder = 'desc';
    }
    this.applyFilters();
  }

  // Réinitialiser les filtres
  resetFilters() {
    this.filters = { ...DEFAULT_FILTERS };
    this.currentPage = 1;
    this.applyFilters();
  }

  // Rechercher
  onSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  // Changer le filtre de consensus
  onConsensusFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  // Changer le filtre de modèle
  onModelFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  // Changer le mode d'affichage
  changeViewMode(mode: 'list' | 'grid') {
    this.viewMode = mode;
  }

  // Sélectionner une entrée (ouvrir détails)
  selectEntry(entry: HistoryEntry) {
    this.selectedEntry = this.selectedEntry?.id === entry.id ? null : entry;
  }

  // Obtenir la classe CSS du consensus
  getConsensusClass(consensus: 'Healthy' | 'At Risk'): string {
    return consensus === 'Healthy' ? 'consensus-healthy' : 'consensus-at-risk';
  }

  // Obtenir l'icône du consensus
  getConsensusIcon(consensus: 'Healthy' | 'At Risk'): string {
    return consensus === 'Healthy' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
  }

  // Obtenir la couleur d'un modèle
  getModelColor(model: MLModel): string {
    return MODEL_CONFIG[model]?.color || '#CED4DA';
  }

  // Obtenir le nom d'affichage d'un modèle
  getModelDisplayName(model: MLModel): string {
    return MODEL_CONFIG[model]?.displayName || model;
  }

  // Obtenir l'icône de tendance
  getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string {
    switch (trend) {
      case 'improving': return 'bi-arrow-up-circle';
      case 'declining': return 'bi-arrow-down-circle';
      default: return 'bi-dash-circle';
    }
  }

  // Obtenir la couleur de tendance
  getTrendColor(trend: 'improving' | 'stable' | 'declining'): string {
    switch (trend) {
      case 'improving': return 'var(--success-green)';
      case 'declining': return 'var(--danger-red)';
      default: return 'var(--gray-600)';
    }
  }

  // Formater la date
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Formater la date relative
  formatRelativeDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  }

  // Supprimer une entrée de Firebase
  deleteEntry(entry: HistoryEntry, event: Event) {
    event.stopPropagation();

    if (confirm(`Voulez-vous vraiment supprimer cette prédiction ?`)) {
      this.firebaseHistory.deleteEntry(entry.id).subscribe({
        next: () => {
          console.log('✅ Entrée supprimée de Firebase');
          this.allEntries = this.allEntries.filter(e => e.id !== entry.id);
          this.applyFilters();
          this.calculateStats();

          if (this.selectedEntry?.id === entry.id) {
            this.selectedEntry = null;
          }
        },
        error: (error) => {
          console.error('❌ Erreur suppression Firebase:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  // Exporter les données
  exportData(format: 'json' | 'csv') {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = exportToJSON(this.filteredEntries);
      filename = `history_${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      content = exportToCSV(this.filteredEntries);
      filename = `history_${Date.now()}.csv`;
      mimeType = 'text/csv';
    }

    // Créer et télécharger le fichier
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Naviguer vers une nouvelle prédiction
  newPrediction() {
    this.router.navigate(['/prediction']);
  }

  // Naviguer vers le dashboard
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  // Rafraîchir les données
  refresh() {
    this.loadHistory();
  }

  // Obtenir le nombre de pages pour la pagination
  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxPages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
