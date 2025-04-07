from django.shortcuts import render
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import UserSerializer, UserRegistrationSerializer
from django.contrib.auth import get_user_model, authenticate
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
import logging
import json

logger = logging.getLogger(__name__)
User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'),
                             email=email, password=password)

            if not user:
                msg = 'Unable to log in with provided credentials.'
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = 'Must include "email" and "password".'
            raise serializers.ValidationError(msg, code='authorization')

        data = super().validate(attrs)
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger.info('Registration request received: %s', request.data)
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                logger.info('User registered successfully: %s', user.email)
                return Response({
                    'user': UserSerializer(user).data,
                    'token': str(refresh.access_token),
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error('Error during user registration: %s', str(e))
                error_message = str(e)
                if 'duplicate key value' in error_message:
                    if 'email' in error_message:
                        return Response({
                            'error': 'This email is already registered'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    elif 'username' in error_message:
                        return Response({
                            'error': 'Username already exists. Please try again.'
                        }, status=status.HTTP_400_BAD_REQUEST)
                return Response({
                    'error': 'Registration failed. Please try again.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        logger.error('Registration validation failed: %s', serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            # Parse the request data if it's a string
            if isinstance(request.data, str):
                data = json.loads(request.data)
            else:
                data = request.data

            logger.info('Login request data: %s', data)
            
            email = data.get('email')
            password = data.get('password')
            
            if not email or not password:
                return Response(
                    {'error': 'Email and password are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = authenticate(email=email, password=password)
            
            if user:
                refresh = RefreshToken.for_user(user)
                serializer = UserSerializer(user)
                logger.info('User logged in successfully: %s', user.email)
                return Response({
                    'user': serializer.data,
                    'token': str(refresh.access_token),
                })
            
            logger.error('Invalid login attempt for email: %s', email)
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except json.JSONDecodeError:
            logger.error('Invalid JSON data received')
            return Response(
                {'error': 'Invalid request data'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error('Login error: %s', str(e))
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
