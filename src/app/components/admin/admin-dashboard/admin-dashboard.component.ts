import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardStatistics } from '../../../models/statistics';
import { StatisticsService } from '../../../services/statistics.service';
import { NotificationService } from '../../../services/notification.service';

interface Bucket {
  label: string;
  value: number;
}

interface DonutSegment extends Bucket {
  color: string;
  percentage: number;
}

interface HistoryPoint {
  at: Date;
  stats: DashboardStatistics;
}

interface PlotPoint {
  x: number;
  y: number;
  value: number;
  time: string;
}

interface AxisTick {
  y: number;
  label: number;
}

interface HoverPointDetail {
  deltaText: string;
  actionText: string;
  trendState: string;
  rateText: string;
  intensity: string;
}

type TrendMetric =
  | 'totalPublications'
  | 'totalProjects'
  | 'totalUsers'
  | 'totalResearchers';

type TrendViewMode = 'live' | 'history' | 'both';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private statisticsService = inject(StatisticsService);
  private notificationService = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);

  stats = signal<DashboardStatistics | null>(null);
  loading = signal<boolean>(true);
  autoRefresh = signal<boolean>(true);
  lastUpdated = signal<Date | null>(null);
  selectedMetric = signal<TrendMetric>('totalPublications');
  trendViewMode = signal<TrendViewMode>('both');

  publicationBuckets = signal<Bucket[]>([]);
  projectBuckets = signal<Bucket[]>([]);
  liveHistory = signal<HistoryPoint[]>([]);
  historicalHistory = signal<HistoryPoint[]>([]);

  @ViewChild('trendChart', { static: false }) trendChart?: ElementRef<HTMLDivElement>;

  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private plotlyImportPromise: Promise<any> | null = null;
  private renderVersion = 0;
  private readonly historySize = 18;
  private readonly refreshMs = 15000;
  private readonly chartPalette = ['#0d6efd', '#198754', '#fd7e14', '#dc3545', '#6f42c1', '#20c997', '#6c757d'];

  ngOnInit(): void {
    this.loadStatistics(true, true);
    this.startAutoRefresh();
  }

  ngAfterViewInit(): void {
    this.renderPlotlyChart();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  refreshDashboard(): void {
    this.loadStatistics(true, true);
  }

  loadStatistics(showLoader = false, updateHistorical = false): void {
    if (showLoader) {
      this.loading.set(true);
    }

    this.statisticsService.getDashboardStatistics().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.publicationBuckets.set(this.toBuckets(data.publicationsByDomain));
        this.projectBuckets.set(this.toBuckets(data.projectsByCategory));
        this.lastUpdated.set(new Date());
        this.pushLiveHistory(data);
        if (updateHistorical) {
          this.pushHistoricalHistory(data);
        }
        this.loading.set(false);
        this.renderPlotlyChart();
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Failed to load dashboard statistics.');
      }
    });
  }

  maxValue(items: Bucket[]): number {
    if (!items.length) return 1;
    return Math.max(...items.map((item) => item.value), 1);
  }

  trackByLabel(_index: number, item: Bucket): string {
    return item.label;
  }

  toggleAutoRefresh(): void {
    this.autoRefresh.set(!this.autoRefresh());
    if (this.autoRefresh()) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  setMetric(metric: TrendMetric): void {
    this.selectedMetric.set(metric);
    this.renderPlotlyChart();
  }

  setTrendViewMode(mode: TrendViewMode): void {
    this.trendViewMode.set(mode);
    this.renderPlotlyChart();
  }

  publicationSegments(): DonutSegment[] {
    return this.toDonutSegments(this.publicationBuckets());
  }

  projectSegments(): DonutSegment[] {
    return this.toDonutSegments(this.projectBuckets());
  }

  publicationsDonutStyle(): string {
    return this.buildConicGradient(this.publicationSegments());
  }

  projectsDonutStyle(): string {
    return this.buildConicGradient(this.projectSegments());
  }

  trendPath(): string {
    if (this.trendViewMode() === 'history') {
      return '';
    }

    const points = this.trendPlotPoints();
    if (points.length <= 1) {
      return '';
    }

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const controlX = (prev.x + curr.x) / 2;
      path += ` Q ${controlX} ${prev.y}, ${curr.x} ${curr.y}`;
    }

    return path;
  }

  historicalTrendPath(): string {
    if (this.trendViewMode() === 'live') {
      return '';
    }

    const points = this.historicalTrendPlotPoints();
    if (points.length <= 1) {
      return '';
    }

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      path += ` H ${curr.x} V ${curr.y}`;
    }

    return path;
  }

  trendPoints(): Array<{ value: number; time: string }> {
    const metric = this.selectedMetric();
    return this.liveHistory().map((point) => ({
      value: point.stats[metric],
      time: point.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }));
  }

  trendMax(): number {
    const values = this.getLiveTrendValues();
    return values.length ? Math.max(...values) : 0;
  }

  trendMin(): number {
    const values = this.getLiveTrendValues();
    return values.length ? Math.min(...values) : 0;
  }

  trendCurrent(): number {
    const values = this.getLiveTrendValues();
    return values.length ? values[values.length - 1] : 0;
  }

  trendDelta(): number {
    const values = this.getLiveTrendValues();
    if (values.length < 2) {
      return 0;
    }
    return values[values.length - 1] - values[values.length - 2];
  }

  trendPlotPoints(): PlotPoint[] {
    return this.buildTrendPlotPoints(this.getLiveTrendValues(), this.getTrendScaleValues(), this.liveHistory());
  }

  historicalTrendPlotPoints(): PlotPoint[] {
    return this.buildTrendPlotPoints(this.getHistoricalTrendValues(), this.getTrendScaleValues(), this.historicalHistory());
  }

  trendSeriesLegend(): Array<{ label: string; color: string; dashed: boolean }> {
    return [
      { label: 'Live', color: '#0d6efd', dashed: false },
      { label: 'Historical average', color: '#fd7e14', dashed: true }
    ];
  }

  trendAxisTicks(): AxisTick[] {
    const values = this.getTrendScaleValues();
    if (!values.length) {
      return [];
    }

    const { height, padding } = this.chartBounds();
    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min === max) {
      return [{ y: height / 2, label: min }];
    }

    const steps = 4;
    const ticks: AxisTick[] = [];
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const value = Math.round((max - (max - min) * ratio) * 100) / 100;
      const y = padding + ((height - padding * 2) * i) / steps;
      ticks.push({ y, label: value });
    }
    return ticks;
  }

  private async renderPlotlyChart(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const container = this.trendChart?.nativeElement;
    const stats = this.stats();
    if (!container || !stats) {
      return;
    }

    const liveValues = this.getLiveTrendValues();
    const historicalValues = this.getHistoricalTrendValues();
    const liveTimes = this.liveHistory().map((point) => point.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const historicalTimes = this.historicalHistory().map((point) => point.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const metricLabel = this.metricLabel(this.selectedMetric());
    const liveHoverDetails = this.buildHoverDetails(liveValues);
    const historicalHoverDetails = this.buildHoverDetails(historicalValues);

    const traces: Array<Record<string, unknown>> = [];

    if (this.trendViewMode() !== 'history') {
      traces.push({
        x: liveTimes,
        y: liveValues,
        customdata: liveHoverDetails.map((item) => [item.deltaText, item.actionText, item.trendState, item.rateText, item.intensity]),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Live',
        line: { color: '#0d6efd', width: 3, shape: 'spline' },
        marker: { color: '#0d6efd', size: 8 },
        hovertemplate:
          '%{x}<br><b>' +
          metricLabel +
          '</b>: %{y}<br><b>Net change</b>: %{customdata[0]}<br><b>Interpretation</b>: %{customdata[1]}<br><b>State</b>: %{customdata[2]}<br><b>Rate</b>: %{customdata[3]}<br><b>Intensity</b>: %{customdata[4]}<extra>Live</extra>'
      });
    }

    if (this.trendViewMode() !== 'live') {
      traces.push({
        x: historicalTimes,
        y: historicalValues,
        customdata: historicalHoverDetails.map((item) => [item.deltaText, item.actionText, item.trendState, item.rateText, item.intensity]),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Historical',
        line: { color: '#fd7e14', width: 2.5, dash: 'dot', shape: 'hv' },
        marker: { color: '#fd7e14', size: 6 },
        hovertemplate:
          '%{x}<br><b>' +
          metricLabel +
          '</b>: %{y}<br><b>Net change</b>: %{customdata[0]}<br><b>Interpretation</b>: %{customdata[1]}<br><b>State</b>: %{customdata[2]}<br><b>Rate</b>: %{customdata[3]}<br><b>Intensity</b>: %{customdata[4]}<extra>Historical</extra>'
      });
    }

    const layout = {
      margin: { l: 44, r: 20, t: 20, b: 44 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: true,
      legend: { orientation: 'h', x: 0, y: 1.12 },
      hovermode: 'x unified',
      xaxis: {
        title: '',
        showgrid: false,
        zeroline: false,
        tickfont: { color: '#6c757d' }
      },
      yaxis: {
        title: '',
        gridcolor: '#e9ecef',
        zeroline: false,
        tickfont: { color: '#6c757d' }
      },
      font: { family: 'inherit', color: '#1f2937' }
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      scrollZoom: false
    };

    const currentRenderVersion = ++this.renderVersion;
    const plotlyModule = await this.loadPlotlyModule();
    if (currentRenderVersion !== this.renderVersion) {
      return;
    }

    await plotlyModule.react(container, traces, layout, config);
  }

  private async loadPlotlyModule(): Promise<any> {
    if (!this.plotlyImportPromise) {
      this.plotlyImportPromise = import('plotly.js-dist-min').then((module) => (module as any).default ?? module);
    }

    return this.plotlyImportPromise;
  }

  private buildTrendPlotPoints(values: number[], scaleValues: number[], pointsSource: HistoryPoint[]): PlotPoint[] {
    if (!values.length) {
      return [];
    }

    const { width, height, padding } = this.chartBounds();
    const min = Math.min(...scaleValues);
    const max = Math.max(...scaleValues);
    const flatSeries = min === max;
    const span = Math.max(max - min, 1);

    return values.map((value, index) => {
      const x =
        values.length === 1
          ? width / 2
          : padding + (index * (width - padding * 2)) / (values.length - 1);

      const y = flatSeries
        ? height / 2
        : height - padding - ((value - min) * (height - padding * 2)) / span;

      return {
        x,
        y,
        value,
        time: pointsSource[index].at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    });
  }

  private getHistoricalTrendValues(): number[] {
    const values = this.historicalHistory();
    if (!values.length) {
      return [];
    }

    const metric = this.selectedMetric();
    return values.map((point) => point.stats[metric]);
  }

  private getTrendScaleValues(): number[] {
    return [...this.getLiveTrendValues(), ...this.getHistoricalTrendValues()];
  }

  metricLabel(metric: TrendMetric): string {
    switch (metric) {
      case 'totalPublications':
        return 'Publications';
      case 'totalProjects':
        return 'Projects';
      case 'totalUsers':
        return 'Users';
      case 'totalResearchers':
        return 'Researchers';
      default:
        return metric;
    }
  }

  topPublicationDomain(): string {
    const top = this.publicationBuckets()[0];
    return top ? `${top.label} (${top.value})` : 'N/A';
  }

  topProjectCategory(): string {
    const top = this.projectBuckets()[0];
    return top ? `${top.label} (${top.value})` : 'N/A';
  }

  private toBuckets(map: Record<string, number>): Bucket[] {
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }

  private toDonutSegments(items: Bucket[]): DonutSegment[] {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    if (!total) {
      return [];
    }

    return items.map((item, index) => ({
      ...item,
      color: this.chartPalette[index % this.chartPalette.length],
      percentage: (item.value / total) * 100
    }));
  }

  private buildConicGradient(segments: DonutSegment[]): string {
    if (!segments.length) {
      return 'conic-gradient(#e9ecef 0 100%)';
    }

    let start = 0;
    const parts = segments.map((segment) => {
      const end = start + segment.percentage;
      const part = `${segment.color} ${start}% ${end}%`;
      start = end;
      return part;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }

  private pushLiveHistory(stats: DashboardStatistics): void {
    const next = [...this.liveHistory(), { at: new Date(), stats }];
    if (next.length > this.historySize) {
      next.shift();
    }
    this.liveHistory.set(next);
  }

  private pushHistoricalHistory(stats: DashboardStatistics): void {
    const next = [...this.historicalHistory(), { at: new Date(), stats }];
    if (next.length > this.historySize) {
      next.shift();
    }
    this.historicalHistory.set(next);
  }

  private getLiveTrendValues(): number[] {
    const metric = this.selectedMetric();
    return this.liveHistory().map((point) => point.stats[metric]);
  }

  private buildHoverDetails(values: number[]): HoverPointDetail[] {
    return values.map((value, index) => {
      const previous = index > 0 ? values[index - 1] : value;
      const delta = value - previous;
      const base = Math.max(previous, 1);
      const rate = (Math.abs(delta) / base) * 100;

      return {
        deltaText: `${delta > 0 ? '+' : ''}${delta}`,
        actionText: this.metricDeltaInterpretation(delta),
        trendState: this.deltaTrendState(delta),
        rateText: `${rate.toFixed(1)}%`,
        intensity: this.deltaIntensity(rate)
      };
    });
  }

  private deltaTrendState(delta: number): string {
    if (delta > 0) {
      return 'Rising';
    }

    if (delta < 0) {
      return 'Falling';
    }

    return 'Stable';
  }

  private deltaIntensity(ratePercent: number): string {
    if (ratePercent === 0) {
      return 'No change';
    }

    if (ratePercent < 5) {
      return 'Low';
    }

    if (ratePercent < 15) {
      return 'Medium';
    }

    return 'High';
  }

  private metricDeltaInterpretation(delta: number): string {
    const metric = this.selectedMetric();

    if (delta === 0) {
      return 'No net change on this interval';
    }

    switch (metric) {
      case 'totalUsers':
        return delta > 0
          ? `${Math.abs(delta)} account(s) added`
          : `${Math.abs(delta)} account(s) removed`;
      case 'totalResearchers':
        return delta > 0
          ? `${Math.abs(delta)} researcher profile(s) added`
          : `${Math.abs(delta)} researcher profile(s) removed`;
      case 'totalProjects':
        return delta > 0
          ? `${Math.abs(delta)} project(s) added`
          : `${Math.abs(delta)} project(s) removed`;
      case 'totalPublications':
        return delta > 0
          ? `${Math.abs(delta)} publication(s) added`
          : `${Math.abs(delta)} publication(s) removed`;
      default:
        return delta > 0 ? `${Math.abs(delta)} item(s) added` : `${Math.abs(delta)} item(s) removed`;
    }
  }

  private chartBounds(): { width: number; height: number; padding: number } {
    return { width: 760, height: 220, padding: 24 };
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => {
      if (this.autoRefresh()) {
        this.loadStatistics(false, false);
      }
    }, this.refreshMs);
  }

  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
