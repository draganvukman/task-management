from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TeamViewSet, CalendarViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'calendar', CalendarViewSet, basename='calendar')

urlpatterns = [
    path('', include(router.urls)),
] 