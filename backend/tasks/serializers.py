from rest_framework import serializers
from .models import Task, Team
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class TeamSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        source='members',
        write_only=True,
        required=False
    )

    class Meta:
        model = Team
        fields = ['id', 'name', 'members', 'member_ids', 'created_at', 'updated_at']

    def create(self, validated_data):
        current_user = self.context['request'].user
        
        team = Team.objects.create(name=validated_data['name'])
        
        team.members.add(current_user)
        
        if 'members' in validated_data:
            team.members.add(*validated_data['members'])
        
        return team

class TaskSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
    team_id = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(),
        source='team',
        write_only=True,
        required=False
    )
    due_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'priority', 'due_date', 
                 'created_at', 'updated_at', 'created_by', 'team', 'team_id']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data) 