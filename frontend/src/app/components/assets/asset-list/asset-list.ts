import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../../core/services/asset.service';

@Component({
  selector: 'app-asset-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './asset-list.html',
})
export class AssetListComponent implements OnInit {
  private svc = inject(AssetService);
  private cdr = inject(ChangeDetectorRef);

  assets: any[] = [];
  search = '';
  ordering = 'name';
  statusFilter = '';
  loading = true;
  loadError = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.loadError = '';
    this.svc.getAll(this.search, this.ordering, this.statusFilter).subscribe({
      next: data => { this.assets = data; this.loading = false; this.cdr.detectChanges(); },
      error: err => {
        this.loading = false;
        this.loadError = err.status === 0
          ? 'Cannot reach the server. Make sure the backend is running.'
          : `Failed to load assets (${err.status}).`;
      }
    });
  }

  delete(id: string) {
    if (!confirm('Delete this asset?')) return;
    this.svc.delete(id).subscribe(() => this.load());
  }

  mediaUrl(path: string) {
    return path ? `http://localhost:8000/media/${path}` : '';
  }
}
