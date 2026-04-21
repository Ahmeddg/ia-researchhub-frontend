import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicationService } from '../../../services/publication.service';
import { DomainService } from '../../../services/domain.service';
import { Publication } from '../../../models/publication';
import { Domain } from '../../../models/domain';
import {
  ClassifyResponse,
  CategoryPrediction,
  PublicationWithClassification
} from '../../../models/classification';

/** Enum for the two wizard steps */
type WizardStep = 'form' | 'review';

@Component({
  selector: 'app-publication-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publication-form.component.html',
  styleUrl: './publication-form.component.css'
})
export class PublicationFormComponent implements OnInit {

  @Output() saveSuccess = new EventEmitter<void>();

  // ── Wizard state ────────────────────────────────────────────────────────────
  currentStep: WizardStep = 'form';
  isClassifying = false;
  isConfirming = false;
  classifyError: string | null = null;
  confirmError: string | null = null;

  // ── Form data ───────────────────────────────────────────────────────────────
  publication: Publication = {
    title: '',
    abstractText: '',
    publicationDate: '',
    pdfUrl: '',
    doi: '',
    journal: '',
    imageUrl: ''
  };

  domains: Domain[] = [];
  selectedDomainId: number | null = null;

  // ── Draft result (after classify) ───────────────────────────────────────────
  savedPublicationId: number | null = null;
  classification: ClassifyResponse | null = null;

  // Editable copies the user can modify in Step 2
  editableCategories: (CategoryPrediction & { editing: boolean; editValue: string })[] = [];
  editableKeywords: string[] = [];
  newKeywordInput = '';

  constructor(
    private publicationService: PublicationService,
    private domainService: DomainService
  ) {}

  ngOnInit(): void {
    this.domainService.getAll().subscribe({
      next: (domains) => { this.domains = domains; },
      error: (err) => console.error('Failed to load domains', err)
    });
  }

  // ── Step 1: Classify & Preview ──────────────────────────────────────────────

  onClassify(): void {
    if (!this.selectedDomainId) { return; }

    // Set domain object on publication before sending
    const selectedDomain = this.domains.find(d => d.id === this.selectedDomainId);
    if (!selectedDomain) { return; }
    this.publication.domain = selectedDomain;

    this.isClassifying = true;
    this.classifyError = null;

    this.publicationService.create(this.publication).subscribe({
      next: (result: PublicationWithClassification) => {
        this.isClassifying = false;
        this.savedPublicationId = result.publication.id ?? null;
        this.classification = result.classification;

        // Build editable lists from AI result
        if (result.classification) {
          this.editableCategories = (result.classification.categories || []).map(cat => ({
            ...cat,
            editing: false,
            editValue: cat.category
          }));
          this.editableKeywords = [...(result.classification.keywords || [])];
        } else {
          this.editableCategories = [];
          this.editableKeywords = [];
        }

        this.currentStep = 'review';
      },
      error: (err) => {
        this.isClassifying = false;
        this.classifyError = err?.error?.message || 'Failed to classify publication. Please try again.';
        console.error('Classification error', err);
      }
    });
  }

  // ── Step 2: Category management ────────────────────────────────────────────

  removeCategory(index: number): void {
    this.editableCategories.splice(index, 1);
  }

  startEditCategory(index: number): void {
    this.editableCategories[index].editing = true;
    this.editableCategories[index].editValue = this.editableCategories[index].category;
  }

  saveEditCategory(index: number): void {
    const cat = this.editableCategories[index];
    cat.category = cat.editValue.trim() || cat.category;
    cat.editing = false;
  }

  cancelEditCategory(index: number): void {
    this.editableCategories[index].editing = false;
  }

  // ── Step 2: Keyword management ─────────────────────────────────────────────

  removeKeyword(index: number): void {
    this.editableKeywords.splice(index, 1);
  }

  addKeyword(): void {
    const kw = this.newKeywordInput.trim();
    if (kw && !this.editableKeywords.includes(kw)) {
      this.editableKeywords.push(kw);
    }
    this.newKeywordInput = '';
  }

  onKeywordInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addKeyword();
    }
  }

  // ── Step 2: Confirm & Publish ───────────────────────────────────────────────

  onConfirm(): void {
    if (!this.savedPublicationId) { return; }

    this.isConfirming = true;
    this.confirmError = null;

    // Serialize approved metadata as JSON strings
    const approvedCategories = JSON.stringify(
      this.editableCategories.map(({ category, confidence, reason }) => ({ category, confidence, reason }))
    );
    const approvedKeywords = JSON.stringify(this.editableKeywords);
    const confidence = this.classification?.confidence ?? null;

    this.publicationService.confirm(
      this.savedPublicationId,
      approvedCategories,
      approvedKeywords,
      confidence
    ).subscribe({
      next: () => {
        this.isConfirming = false;
        this.saveSuccess.emit();
        this.resetForm();
      },
      error: (err) => {
        this.isConfirming = false;
        this.confirmError = err?.error?.message || 'Failed to confirm publication. Please try again.';
        console.error('Confirm error', err);
      }
    });
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  goBackToForm(): void {
    this.currentStep = 'form';
    this.classifyError = null;
  }

  private resetForm(): void {
    this.publication = {
      title: '',
      abstractText: '',
      publicationDate: '',
      pdfUrl: '',
      doi: '',
      journal: '',
      imageUrl: ''
    };
    this.selectedDomainId = null;
    this.currentStep = 'form';
    this.savedPublicationId = null;
    this.classification = null;
    this.editableCategories = [];
    this.editableKeywords = [];
    this.newKeywordInput = '';
    this.classifyError = null;
    this.confirmError = null;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  get confidencePercent(): number {
    return Math.round((this.classification?.confidence ?? 0) * 100);
  }

  get confidenceColor(): string {
    const pct = this.confidencePercent;
    if (pct >= 75) return '#22d3ee';
    if (pct >= 50) return '#a78bfa';
    return '#f87171';
  }

  get isOutlier(): boolean {
    return (this.classification?.clusterId ?? 0) === -1;
  }
}
