from django_filters import rest_framework as filters
from .models import Task

class TaskFilter(filters.FilterSet):
    status = filters.CharFilter(field_name='status')
    priority = filters.CharFilter(field_name='priority')
    team = filters.NumberFilter(field_name='team')
    due_date = filters.DateFilter(field_name='due_date')
    due_date__gte = filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_date__lte = filters.DateFilter(field_name='due_date', lookup_expr='lte')

    class Meta:
        model = Task
        fields = ['status', 'priority', 'team', 'due_date'] 