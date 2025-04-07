from django.test import TestCase
from django.contrib.auth.models import User
from .models import Task, Team
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta

class TaskModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.team = Team.objects.create(name='Test Team')
        self.team.members.add(self.user)

    def test_create_task(self):
        task = Task.objects.create(
            title='Test Task',
            description='Test Description',
            status='T',
            priority='M',
            due_date=date.today() + timedelta(days=7),
            created_by=self.user,
            team=self.team
        )
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.status, 'T')
        self.assertEqual(task.priority, 'M')
        self.assertEqual(task.created_by, self.user)
        self.assertEqual(task.team, self.team)

class TeamModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_create_team(self):
        team = Team.objects.create(name='Test Team')
        team.members.add(self.user)
        self.assertEqual(team.name, 'Test Team')
        self.assertIn(self.user, team.members.all())

class TaskViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.team = Team.objects.create(name='Test Team')
        self.team.members.add(self.user)

    def test_create_task(self):
        data = {
            'title': 'New Task',
            'description': 'Task Description',
            'status': 'T',
            'priority': 'M',
            'due_date': date.today() + timedelta(days=7),
            'team': self.team.id
        }
        response = self.client.post('/api/tasks/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(Task.objects.get().title, 'New Task')

    def test_list_tasks(self):
        Task.objects.create(
            title='Test Task',
            description='Test Description',
            status='T',
            priority='M',
            due_date=date.today() + timedelta(days=7),
            created_by=self.user,
            team=self.team
        )
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_update_task(self):
        task = Task.objects.create(
            title='Test Task',
            description='Test Description',
            status='T',
            priority='M',
            due_date=date.today() + timedelta(days=7),
            created_by=self.user,
            team=self.team
        )
        data = {
            'title': 'Updated Task',
            'description': 'Updated Description',
            'status': 'P',
            'priority': 'H',
            'due_date': date.today() + timedelta(days=14),
            'team': self.team.id
        }
        response = self.client.put(f'/api/tasks/{task.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.title, 'Updated Task')
        self.assertEqual(task.status, 'P')
        self.assertEqual(task.priority, 'H')

    def test_delete_task(self):
        task = Task.objects.create(
            title='Test Task',
            description='Test Description',
            status='T',
            priority='M',
            due_date=date.today() + timedelta(days=7),
            created_by=self.user,
            team=self.team
        )
        response = self.client.delete(f'/api/tasks/{task.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

class TeamViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_team(self):
        data = {
            'name': 'New Team',
            'members': [self.user.id]
        }
        response = self.client.post('/api/teams/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Team.objects.count(), 1)
        self.assertEqual(Team.objects.get().name, 'New Team')

    def test_list_teams(self):
        team = Team.objects.create(name='Test Team')
        team.members.add(self.user)
        response = self.client.get('/api/teams/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_update_team(self):
        team = Team.objects.create(name='Test Team')
        team.members.add(self.user)
        data = {
            'name': 'Updated Team',
            'members': [self.user.id]
        }
        response = self.client.put(f'/api/teams/{team.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        team.refresh_from_db()
        self.assertEqual(team.name, 'Updated Team')

    def test_delete_team(self):
        team = Team.objects.create(name='Test Team')
        team.members.add(self.user)
        response = self.client.delete(f'/api/teams/{team.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Team.objects.count(), 0)
