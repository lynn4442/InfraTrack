import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TechnicianService } from '../../../core/services/technician.service';

@Component({
  selector: 'app-technician-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './technician-form.html',
})
export class TechnicianFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(TechnicianService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  id: string | null = null;
  photoFile: File | null = null;
  certFile: File | null = null;
  photoPreview: string | null = null;

  form = this.fb.group({
    name:           ['', Validators.required],
    email:          ['', [Validators.required, Validators.email]],
    hire_date:      ['', Validators.required],
    specialization: ['', Validators.required],
  });

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.svc.getOne(this.id).subscribe(t => {
        this.form.patchValue(t);
        if (t.photo) this.photoPreview = `http://localhost:8000/media/${t.photo}`;
      });
    }
  }

  onPhoto(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.photoFile = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => { this.photoPreview = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }
  onCert(e: Event)   { this.certFile  = (e.target as HTMLInputElement).files?.[0] ?? null; }

  error = '';

  submit() {
    if (this.form.invalid) return;
    const fd = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => { if (v != null) fd.append(k, v as string); });
    if (this.photoFile) fd.append('photo', this.photoFile);
    if (this.certFile)  fd.append('certification', this.certFile);

    const req = this.id ? this.svc.update(this.id, fd) : this.svc.create(fd);
    req.subscribe({
      next: () => this.router.navigate(['/technicians']),
      error: (err) => this.error = err.error?.error || 'Something went wrong. Check all fields.',
    });
  }
}
