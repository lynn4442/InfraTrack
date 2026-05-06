import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AssetService } from '../../../core/services/asset.service';
import { TechnicianService } from '../../../core/services/technician.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-asset-form',
  imports: [ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './asset-form.html',
})
export class AssetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(AssetService);
  private techSvc = inject(TechnicianService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  id: string | null = null;
  technicians: any[] = [];
  selectedTechIds: string[] = [];
  imageFile: File | null = null;
  docFile: File | null = null;

  form = this.fb.group({
    name:         ['', Validators.required],
    asset_type:   ['', Validators.required],
    ip_address:   ['', [Validators.required, Validators.pattern(/^(\d{1,3}\.){3}\d{1,3}$/)]],
    purchase_date:['', Validators.required],
    status:       ['active', Validators.required],
  });

  ngOnInit() {
    this.techSvc.getAll().subscribe(data => this.technicians = data);
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.svc.getOne(this.id).subscribe(a => {
        this.form.patchValue(a);
        this.selectedTechIds = a.technician_ids || [];
      });
    }
  }

  toggleTech(id: string) {
    this.selectedTechIds = this.selectedTechIds.includes(id)
      ? this.selectedTechIds.filter(t => t !== id)
      : [...this.selectedTechIds, id];
  }

  onImage(e: Event) { this.imageFile = (e.target as HTMLInputElement).files?.[0] ?? null; }
  onDoc(e: Event)   { this.docFile   = (e.target as HTMLInputElement).files?.[0] ?? null; }

  error = '';

  submit() {
    if (this.form.invalid) return;
    const fd = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => { if (v != null) fd.append(k, v as string); });
    this.selectedTechIds.forEach(id => fd.append('technician_ids', id));
    if (this.imageFile) fd.append('asset_image', this.imageFile);
    if (this.docFile)   fd.append('technical_doc', this.docFile);

    const req = this.id ? this.svc.update(this.id, fd) : this.svc.create(fd);
    req.subscribe({
      next: () => this.router.navigate(['/assets']),
      error: (err) => this.error = err.error?.error || 'Something went wrong. Check all fields.',
    });
  }
}
