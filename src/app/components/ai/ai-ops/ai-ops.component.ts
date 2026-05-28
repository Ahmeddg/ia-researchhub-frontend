import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription, forkJoin } from 'rxjs';
import { AiOpsService } from '../../../services/ai-ops.service';
import {
  HealthResponse,
  ClusterInfo,
  ClusterMetrics,
  ReclusterResponse,
  ReclusterHistoryEntry,
  ClosePair,
  SystemConfig,
  CorrectionEntry,
  TaxonomyTreeResponse,
  TaxonomyL1Node,
  TaxonomyL2Node,
} from '../../../models/classification';

type SortField = 'label' | 'member_count' | 'intra_cluster_mean_similarity'
  | 'correction_rate_30d' | 'centroid_drift' | 'l1_label';
type SortDir = 'asc' | 'desc';

type ClusterRow = ClusterInfo & Partial<ClusterMetrics> & { health: 'green' | 'amber' | 'red' };

@Component({
  selector: 'app-ai-ops',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './ai-ops.component.html',
  styleUrl: './ai-ops.component.css',
})
export class AiOpsComponent implements OnInit, OnDestroy {
  private svc = inject(AiOpsService);
  private refreshSub?: Subscription;

  // ── Loading / error ──────────────────────────────────────────────────────
  loading = true;
  error = '';
  reclustering = false;
  reclusterResult: ReclusterResponse | null = null;
  activeTab: 'health' | 'config' | 'corrections' | 'taxonomy' = 'health';

  // ── System Config ────────────────────────────────────────────────────────
  systemConfig: SystemConfig = {};
  savingConfig = false;
  configSuccess = '';
  configError = '';

  // ── Corrections ────────────────────────────────────────────────────────
  corrections: CorrectionEntry[] = [];
  loadingCorrections = false;

  // ── Taxonomy Tree ──────────────────────────────────────────────────────
  taxonomyTree: TaxonomyTreeResponse | null = null;
  loadingTaxonomy = false;

  // ── Section 1 data ────────────────────────────────────────────────────────
  health: HealthResponse = { status: 'LOADING', model_loaded: false };
  runLog: ReclusterHistoryEntry[] = [];
  runLogExpanded = false;
  lastRunAgo = '';

  // ── Section 2 data ────────────────────────────────────────────────────────
  clusterRows: ClusterRow[] = [];
  filteredRows: ClusterRow[] = [];
  sortField: SortField = 'member_count';
  sortDir: SortDir = 'desc';
  filterText = '';
  filterL1 = '';
  l1Options: string[] = [];

  // ── Close pairs ───────────────────────────────────────────────────────────
  closePairs: ClosePair[] = [];
  closePairThreshold = 0.90;
  loadingPairs = false;

  // ── Smart trigger thresholds (mirrors config.py defaults) ────────────────
  readonly PAPER_TRIGGER  = 200;
  readonly PENDING_TRIGGER = 50;
  readonly TIME_TRIGGER_H  = 24;

  papersSinceLast = 0;
  pendingCount    = 0;
  hoursSinceLast  = 0;

  ngOnInit(): void {
    this.load();
    this.loadConfig();
    this.loadCorrections();
    this.loadCorrections();
    this.loadTaxonomy();
    // Auto-refresh every 30 seconds
    this.refreshSub = interval(30_000).subscribe(() => {
      this.load();
      if (this.activeTab === 'config') this.loadConfig();
      if (this.activeTab === 'corrections') this.loadCorrections();
      if (this.activeTab === 'taxonomy') this.loadTaxonomy();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      health:   this.svc.getHealth(),
      clusters: this.svc.getClusters(),
      metrics:  this.svc.getClusterMetrics(),
      log:      this.svc.getReclusterHistory(10),
    }).subscribe({
      next: ({ health, clusters, metrics, log }) => {
        this.health  = health;
        this.runLog  = log;
        this.buildClusterRows(clusters, metrics);
        this.computeTriggerBars();
        this.computeLastRunAgo();
        this.loading = false;
      },
      error: () => {
        this.error   = 'AI service is currently unavailable.';
        this.loading = false;
      },
    });
  }

  // ── Config ────────────────────────────────────────────────────────────────
  
  loadConfig(): void {
    this.svc.getSystemConfig().subscribe(config => {
      this.systemConfig = config;
    });
  }

  saveConfigKey(key: string, value: any): void {
    this.savingConfig = true;
    this.configSuccess = '';
    this.configError = '';
    this.svc.updateSystemConfig(key, value.toString()).subscribe({
      next: () => {
        this.savingConfig = false;
        this.configSuccess = `Saved ${key} successfully`;
        setTimeout(() => this.configSuccess = '', 3000);
      },
      error: (err) => {
        this.savingConfig = false;
        this.configError = `Failed to save ${key}`;
      }
    });
  }

  // ── Corrections ──────────────────────────────────────────────────────────

  loadCorrections(): void {
    this.loadingCorrections = true;
    this.svc.getCorrections(0, 50).subscribe(res => {
      this.corrections = res;
      this.loadingCorrections = false;
    });
  }

  // ── Cluster table ─────────────────────────────────────────────────────────

  private buildClusterRows(clusters: ClusterInfo[], metrics: ClusterMetrics[]): void {
    const metricMap = new Map<number, ClusterMetrics>(
      metrics.map(m => [m.cluster_id, m])
    );

    this.clusterRows = clusters.map(c => {
      const m = metricMap.get(c.cluster_id);
      const tightness = m?.intra_cluster_mean_similarity;
      const corrRate  = m?.correction_rate_30d;

      let health: 'green' | 'amber' | 'red' = 'green';
      if (tightness != null && corrRate != null) {
        if (tightness < 0.50 || corrRate > 0.10) health = 'red';
        else if (tightness < 0.70 || corrRate > 0.05) health = 'amber';
      }

      return { ...c, ...m, health };
    });

    // Collect unique L1 labels for the filter dropdown
    this.l1Options = [...new Set(
      this.clusterRows.map(r => r.l1_label ?? '').filter(Boolean)
    )].sort();

    this.applyFilter();
  }

  applyFilter(): void {
    const txt = this.filterText.toLowerCase();
    this.filteredRows = this.clusterRows
      .filter(r => {
        const matchTxt = !txt || r.label.toLowerCase().includes(txt);
        const matchL1  = !this.filterL1 || r.l1_label === this.filterL1;
        return matchTxt && matchL1;
      });
    this.applySort();
  }

  sort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'desc';
    }
    this.applySort();
  }

  private applySort(): void {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    this.filteredRows = [...this.filteredRows].sort((a, b) => {
      const av = (a as any)[this.sortField] ?? (this.sortDir === 'asc' ? Infinity : -Infinity);
      const bv = (b as any)[this.sortField] ?? (this.sortDir === 'asc' ? Infinity : -Infinity);
      return typeof av === 'string'
        ? av.localeCompare(bv) * dir
        : (av - bv) * dir;
    });
  }

  sortIcon(field: SortField): string {
    if (this.sortField !== field) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  // ── Smart trigger bars ────────────────────────────────────────────────────

  private computeTriggerBars(): void {
    const lastCount = this.runLog[0]?.total_publications ?? 0;
    // pending_count comes from health if FastAPI surfaces it
    this.pendingCount    = (this.health as any).pending_count ?? 0;
    this.papersSinceLast = Math.max(0, (this.health as any).total_papers_since_last_run ?? lastCount);
    this.hoursSinceLast  = this.runLog[0] ? this.hoursAgo(this.runLog[0].started_at) : 0;
  }

  triggerPercent(value: number, max: number): number {
    return Math.min(100, Math.round((value / max) * 100));
  }

  get anyTriggerMet(): boolean {
    return this.papersSinceLast  >= this.PAPER_TRIGGER
        || this.pendingCount      >= this.PENDING_TRIGGER
        || this.hoursSinceLast    >= this.TIME_TRIGGER_H;
  }

  // ── Recluster ─────────────────────────────────────────────────────────────

  triggerRecluster(): void {
    this.reclustering = true;
    this.svc.triggerRecluster().subscribe({
      next: result => {
        this.reclusterResult = result;
        this.reclustering    = false;
        this.load();
      },
      error: () => {
        this.reclustering = false;
        this.error = 'Failed to trigger re-clustering.';
      },
    });
  }

  // ── Close Pairs ───────────────────────────────────────────────────────────

  loadClosePairs(): void {
    this.loadingPairs = true;
    this.svc.getClosePairs(this.closePairThreshold).subscribe({
      next: pairs => { this.closePairs = pairs; this.loadingPairs = false; },
      error: ()  => { this.closePairs = [];     this.loadingPairs = false; },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private computeLastRunAgo(): void {
    if (!this.runLog.length) { this.lastRunAgo = 'Never'; return; }
    const h = this.hoursAgo(this.runLog[0].started_at);
    if (h < 1)      this.lastRunAgo = `${Math.round(h * 60)}m ago`;
    else if (h < 24) this.lastRunAgo = `${Math.round(h)}h ago`;
    else             this.lastRunAgo = `${Math.round(h / 24)}d ago`;
  }

  private hoursAgo(iso: string): number {
    return (Date.now() - new Date(iso).getTime()) / 3_600_000;
  }

  pct(value?: number): string {
    return value != null ? `${(value * 100).toFixed(1)}%` : '—';
  }

  fmt(value?: number, digits = 3): string {
    return value != null ? value.toFixed(digits) : '—';
  }

  // ── Taxonomy Logic ──────────────────────────────────────────────────────
  loadTaxonomy(): void {
    this.loadingTaxonomy = true;
    this.svc.getTaxonomy().subscribe({
      next: (tree) => {
        // Expand all L1 nodes by default, but leave L2 nodes collapsed for neatness
        if (tree?.l1_nodes) {
          tree.l1_nodes.forEach((l1: TaxonomyL1Node) => l1._expanded = true);
        }
        this.taxonomyTree = tree;
        this.loadingTaxonomy = false;
      },
      error: (err) => {
        console.error('Error fetching taxonomy tree', err);
        this.loadingTaxonomy = false;
      }
    });
  }

  toggleL1(node: TaxonomyL1Node): void {
    node._expanded = !node._expanded;
  }

  toggleL2(node: TaxonomyL2Node): void {
    node._expanded = !node._expanded;
  }

  runDuration(entry: ReclusterHistoryEntry): string {
    if (!entry.duration_seconds) return '—';
    return entry.duration_seconds < 60
      ? `${entry.duration_seconds.toFixed(1)}s`
      : `${(entry.duration_seconds / 60).toFixed(1)}m`;
  }
}
