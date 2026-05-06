from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.conf import settings
from bson.objectid import ObjectId
import os

from .db import technicians, assets, incidents


# ── helpers ───────────────────────────────────────────────────────────────────

def fix_id(doc):
    doc['_id'] = str(doc['_id'])
    return doc


def save_file(file, folder):
    dir_path = os.path.join(settings.MEDIA_ROOT, folder)
    os.makedirs(dir_path, exist_ok=True)
    filepath = os.path.join(folder, file.name)
    with open(os.path.join(settings.MEDIA_ROOT, filepath), 'wb+') as f:
        for chunk in file.chunks():
            f.write(chunk)
    return filepath


# ── auth ──────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({'error': 'username and password required'}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'username already taken'}, status=400)
        User.objects.create_user(username=username, password=password)
        return Response({'message': 'user created'}, status=201)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'error': 'invalid credentials'}, status=401)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


# ── technicians ───────────────────────────────────────────────────────────────

class TechnicianListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = {}
        search = request.GET.get('search', '')
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}},
                {'specialization': {'$regex': search, '$options': 'i'}},
            ]
        ordering = request.GET.get('ordering', 'name')
        direction = -1 if ordering.startswith('-') else 1
        ordering = ordering.lstrip('-')
        results = [fix_id(t) for t in technicians.find(query).sort(ordering, direction)]
        return Response(results)

    def post(self, request):
        data = request.data
        photo = request.FILES.get('photo')
        cert = request.FILES.get('certification')
        doc = {
            'name': data.get('name'),
            'email': data.get('email'),
            'hire_date': data.get('hire_date'),
            'specialization': data.get('specialization'),
            'photo': save_file(photo, 'technicians/photos') if photo else '',
            'certification': save_file(cert, 'technicians/certs') if cert else '',
        }
        result = technicians.insert_one(doc)
        doc['_id'] = str(result.inserted_id)
        return Response(doc, status=201)


class TechnicianDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        t = technicians.find_one({'_id': ObjectId(pk)})
        if not t:
            return Response({'error': 'not found'}, status=404)
        return Response(fix_id(t))

    def put(self, request, pk):
        data = request.data
        update = {
            'name': data.get('name'),
            'email': data.get('email'),
            'hire_date': data.get('hire_date'),
            'specialization': data.get('specialization'),
        }
        photo = request.FILES.get('photo')
        cert = request.FILES.get('certification')
        if photo:
            update['photo'] = save_file(photo, 'technicians/photos')
        if cert:
            update['certification'] = save_file(cert, 'technicians/certs')
        technicians.update_one({'_id': ObjectId(pk)}, {'$set': update})
        return Response(fix_id(technicians.find_one({'_id': ObjectId(pk)})))

    def delete(self, request, pk):
        technicians.delete_one({'_id': ObjectId(pk)})
        return Response(status=204)


# ── assets ────────────────────────────────────────────────────────────────────

class AssetListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = {}
        search = request.GET.get('search', '')
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'asset_type': {'$regex': search, '$options': 'i'}},
                {'ip_address': {'$regex': search, '$options': 'i'}},
            ]
        status_filter = request.GET.get('status', '')
        if status_filter:
            query['status'] = status_filter
        ordering = request.GET.get('ordering', 'name')
        direction = -1 if ordering.startswith('-') else 1
        ordering = ordering.lstrip('-')
        results = [fix_id(a) for a in assets.find(query).sort(ordering, direction)]
        return Response(results)

    def post(self, request):
        data = request.data
        image = request.FILES.get('asset_image')
        doc_file = request.FILES.get('technical_doc')
        doc = {
            'name': data.get('name'),
            'asset_type': data.get('asset_type'),
            'ip_address': data.get('ip_address'),
            'purchase_date': data.get('purchase_date'),
            'status': data.get('status'),
            'technician_ids': request.data.getlist('technician_ids'),
            'asset_image': save_file(image, 'assets/images') if image else '',
            'technical_doc': save_file(doc_file, 'assets/docs') if doc_file else '',
        }
        result = assets.insert_one(doc)
        doc['_id'] = str(result.inserted_id)
        return Response(doc, status=201)


class AssetDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        a = assets.find_one({'_id': ObjectId(pk)})
        if not a:
            return Response({'error': 'not found'}, status=404)
        return Response(fix_id(a))

    def put(self, request, pk):
        data = request.data
        update = {
            'name': data.get('name'),
            'asset_type': data.get('asset_type'),
            'ip_address': data.get('ip_address'),
            'purchase_date': data.get('purchase_date'),
            'status': data.get('status'),
            'technician_ids': request.data.getlist('technician_ids'),
        }
        image = request.FILES.get('asset_image')
        doc_file = request.FILES.get('technical_doc')
        if image:
            update['asset_image'] = save_file(image, 'assets/images')
        if doc_file:
            update['technical_doc'] = save_file(doc_file, 'assets/docs')
        assets.update_one({'_id': ObjectId(pk)}, {'$set': update})
        return Response(fix_id(assets.find_one({'_id': ObjectId(pk)})))

    def delete(self, request, pk):
        assets.delete_one({'_id': ObjectId(pk)})
        return Response(status=204)


# ── incidents ─────────────────────────────────────────────────────────────────

class IncidentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = {}
        search = request.GET.get('search', '')
        if search:
            query['$or'] = [
                {'title': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}},
            ]
        severity_filter = request.GET.get('severity', '')
        if severity_filter:
            query['severity'] = severity_filter
        ordering = request.GET.get('ordering', '-reported_date')
        direction = -1 if ordering.startswith('-') else 1
        ordering = ordering.lstrip('-')
        results = []
        for i in incidents.find(query).sort(ordering, direction):
            fix_id(i)
            try:
                asset = assets.find_one({'_id': ObjectId(i['asset_id'])}) if i.get('asset_id') else None
                i['asset_name'] = asset['name'] if asset else '—'
            except Exception:
                i['asset_name'] = '—'
            try:
                tech = technicians.find_one({'_id': ObjectId(i['assigned_to_id'])}) if i.get('assigned_to_id') else None
                i['assigned_to_name'] = tech['name'] if tech else '—'
            except Exception:
                i['assigned_to_name'] = '—'
            results.append(i)
        return Response(results)

    def post(self, request):
        data = request.data
        report = request.FILES.get('report_pdf')
        doc = {
            'title': data.get('title'),
            'description': data.get('description'),
            'severity': data.get('severity'),
            'reported_date': data.get('reported_date'),
            'resolved_date': data.get('resolved_date') or None,
            'asset_id': data.get('asset_id'),
            'assigned_to_id': data.get('assigned_to_id'),
            'report_pdf': save_file(report, 'incidents/reports') if report else '',
        }
        result = incidents.insert_one(doc)
        doc['_id'] = str(result.inserted_id)
        return Response(doc, status=201)


class IncidentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        i = incidents.find_one({'_id': ObjectId(pk)})
        if not i:
            return Response({'error': 'not found'}, status=404)
        return Response(fix_id(i))

    def put(self, request, pk):
        data = request.data
        update = {
            'title': data.get('title'),
            'description': data.get('description'),
            'severity': data.get('severity'),
            'reported_date': data.get('reported_date'),
            'resolved_date': data.get('resolved_date') or None,
            'asset_id': data.get('asset_id'),
            'assigned_to_id': data.get('assigned_to_id'),
        }
        report = request.FILES.get('report_pdf')
        if report:
            update['report_pdf'] = save_file(report, 'incidents/reports')
        incidents.update_one({'_id': ObjectId(pk)}, {'$set': update})
        return Response(fix_id(incidents.find_one({'_id': ObjectId(pk)})))

    def delete(self, request, pk):
        incidents.delete_one({'_id': ObjectId(pk)})
        return Response(status=204)
