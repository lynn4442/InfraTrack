from django.db import models


class Technician(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    hire_date = models.DateField()
    photo = models.ImageField(upload_to='technicians/photos/')
    certification = models.FileField(upload_to='technicians/certs/')
    specialization = models.CharField(max_length=50)

    class Meta:
        managed = False


class Asset(models.Model):
    name = models.CharField(max_length=100)
    asset_type = models.CharField(max_length=50)
    ip_address = models.CharField(max_length=45)
    purchase_date = models.DateField()
    status = models.CharField(max_length=20)
    technical_doc = models.FileField(upload_to='assets/docs/')
    asset_image = models.ImageField(upload_to='assets/images/')
    technicians = models.ManyToManyField(Technician)

    class Meta:
        managed = False


class Incident(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=20)
    reported_date = models.DateField()
    resolved_date = models.DateField(null=True, blank=True)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(Technician, on_delete=models.CASCADE)
    report_pdf = models.FileField(upload_to='incidents/reports/')

    class Meta:
        managed = False
