import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TechnicianService } from '../../../core/services/technician.service';

@Component({
  selector: 'app-technician-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './technician-list.html',
})
export class TechnicianListComponent implements OnInit {
  private svc = inject(TechnicianService);
  private cdr = inject(ChangeDetectorRef);

  technicians: any[] = [];
  search = '';
  ordering = 'name';
  loading = true;
  loadError = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.loadError = '';
    this.svc.getAll(this.search, this.ordering).subscribe({
      next: data => { this.technicians = data; this.loading = false; this.cdr.detectChanges(); },
      error: err => {
        this.loading = false;
        this.loadError = err.status === 0
          ? 'Cannot reach the server. Make sure the backend is running.'
          : `Failed to load technicians (${err.status}).`;
      }
    });
  }

  delete(id: string) {
    if (!confirm('Delete this technician?')) return;
    this.svc.delete(id).subscribe(() => this.load());
  }

  mediaUrl(path: string) {
    return path ? `http://localhost:8000/media/${path}` : '';
  }
}
