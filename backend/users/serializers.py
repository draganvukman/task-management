from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import User
import logging
import uuid

logger = logging.getLogger(__name__)
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )
        return user

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'name', 'password', 'password2')

    def validate(self, attrs):
        logger.info('Validating registration data: %s', attrs)
        
        # Check if passwords match
        if attrs['password'] != attrs['password2']:
            logger.error('Passwords do not match')
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Validate password
        try:
            validate_password(attrs['password'])
        except Exception as e:
            logger.error('Password validation failed: %s', str(e))
            raise serializers.ValidationError({"password": str(e)})
        
        return attrs

    def create(self, validated_data):
        logger.info('Creating user with data: %s', validated_data)
        validated_data.pop('password2')
        
        # Generate a unique username
        validated_data['username'] = f"user_{uuid.uuid4().hex[:10]}"
        
        try:
            user = User.objects.create_user(**validated_data)
            logger.info('User created successfully: %s', user.email)
            return user
        except Exception as e:
            logger.error('Error creating user: %s', str(e))
            raise serializers.ValidationError({"error": str(e)}) 