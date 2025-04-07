from django.shortcuts import render
from rest_framework import generics, permissions, filters, viewsets, status
from django_filters.rest_framework import DjangoFilterBackend
from .models import Task, Team
from .serializers import TaskSerializer, TeamSerializer
from .filters import TaskFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import os.path
import pickle
import datetime
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

# Create your views here.

class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']

    def get_queryset(self):
        return Task.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(created_by=self.request.user)

class TeamTaskListView(generics.ListAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']

    def get_queryset(self):
        return Task.objects.filter(assigned_to=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']

    def get_queryset(self):
        queryset = Task.objects.all()
        
        # Filter by team if team_id is provided
        team_id = self.request.query_params.get('team_id', None)
        if team_id:
            queryset = queryset.filter(team_id=team_id)
        
        # Return tasks where the user is either the creator or a team member
        return queryset.filter(
            models.Q(created_by=self.request.user) |
            models.Q(team__members=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(members=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        team = serializer.save()
        if self.request.user not in team.members.all():
            team.members.add(self.request.user)

class CalendarViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def events(self, request):
        try:
            creds = None
            if os.path.exists('token.json'):
                creds = Credentials.from_authorized_user_file('token.json', ['https://www.googleapis.com/auth/calendar'])
            
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        'credentials.json', ['https://www.googleapis.com/auth/calendar'])
                    creds = flow.run_local_server(port=0)
                with open('token.json', 'w') as token:
                    token.write(creds.to_json())

            service = build('calendar', 'v3', credentials=creds)
            now = datetime.utcnow().isoformat() + 'Z'
            events_result = service.events().list(
                calendarId='primary',
                timeMin=now,
                maxResults=10,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            events = events_result.get('items', [])
            return Response(events)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def sync(self, request):
        try:
            task = request.data
            creds = Credentials.from_authorized_user_file('token.json', ['https://www.googleapis.com/auth/calendar'])
            service = build('calendar', 'v3', credentials=creds)
            
            event = {
                'summary': task['title'],
                'description': task['description'],
                'start': {
                    'dateTime': task['due_date'],
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': (datetime.fromisoformat(task['due_date']) + timedelta(hours=1)).isoformat(),
                    'timeZone': 'UTC',
                },
            }
            
            event = service.events().insert(calendarId='primary', body=event).execute()
            return Response(event)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
