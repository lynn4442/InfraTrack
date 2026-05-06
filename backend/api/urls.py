from django.urls import path
from .views import (
    RegisterView, LoginView,
    TechnicianListView, TechnicianDetailView,
    AssetListView, AssetDetailView,
    IncidentListView, IncidentDetailView,
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),

    path('technicians/', TechnicianListView.as_view()),
    path('technicians/<str:pk>/', TechnicianDetailView.as_view()),

    path('assets/', AssetListView.as_view()),
    path('assets/<str:pk>/', AssetDetailView.as_view()),

    path('incidents/', IncidentListView.as_view()),
    path('incidents/<str:pk>/', IncidentDetailView.as_view()),
]
