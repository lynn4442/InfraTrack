import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IncidentService } from '../../../core/services/incident.service';

@Component({
  selector: 'app-incident-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './incident-list.html',
})
export class IncidentListComponent implements OnInit {
  private svc = inject(IncidentService);
  private cdr = inject(ChangeDetectorRef);

  incidents: any[] = [];
  search = '';
  ordering = '-reported_date';
  severityFilter = '';
  loading = true;
  loadError = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.loadError = '';
    this.svc.getAll(this.search, this.ordering, this.severityFilter).subscribe({
      next: data => { this.incidents = data; this.loading = false; this.cdr.detectChanges(); },
      error: err => {
        this.loading = false;
        this.loadError = err.status === 0
          ? 'Cannot reach the server. Make sure the backend is running.'
          : `Failed to load incidents (${err.status}).`;
      }
    });
  }

  delete(id: string) {
    if (!confirm('Delete this incident?')) return;
    this.svc.delete(id).subscribe(() => this.load());
  }

  mediaUrl(path: string) {
    return path ? `http://localhost:8000/media/${path}` : '';
  }
}
