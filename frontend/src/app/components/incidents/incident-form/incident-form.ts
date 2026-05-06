import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { IncidentService } from '../../../core/services/incident.service';
import { AssetService } from '../../../core/services/asset.service';
import { TechnicianService } from '../../../core/services/technician.service';

@Component({
  selector: 'app-incident-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './incident-form.html',
})
export class IncidentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(IncidentService);
  private assetSvc = inject(AssetService);
  private techSvc = inject(TechnicianService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  id: string | null = null;
  assets: any[] = [];
  technicians: any[] = [];
  reportFile: File | null = null;
  error = '';

  form = this.fb.group({
    title:          ['', Validators.required],
    description:    ['', Validators.required],
    severity:       ['medium', Validators.required],
    reported_date:  ['', Validators.required],
    resolved_date:  [''],
    asset_id:       ['', Validators.required],
    assigned_to_id: ['', Validators.required],
  });

  ngOnInit() {
    this.assetSvc.getAll().subscribe(data => this.assets = data);
    this.techSvc.getAll().subscribe(data => this.technicians = data);
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.svc.getOne(this.id).subscribe(i => this.form.patchValue(i));
    }
  }

  onReport(e: Event) { this.reportFile = (e.target as HTMLInputElement).files?.[0] ?? null; }

  submit() {
    if (this.form.invalid) return;
    const fd = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => { if (v != null && v !== '') fd.append(k, v as string); });
    if (this.reportFile) fd.append('report_pdf', this.reportFile);

    const req = this.id ? this.svc.update(this.id, fd) : this.svc.create(fd);
    req.subscribe({
      next: () => this.router.navigate(['/incidents']),
      error: (err) => this.error = err.error?.error || 'Something went wrong. Check all fields.',
    });
  }
}
