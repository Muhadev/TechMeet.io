from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
import json

User = get_user_model()

class UserAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.user_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': 'TestPassword123!',
            'password2': 'TestPassword123!',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'ATTENDEE'
        }
        
    def test_user_registration(self):
        response = self.client.post(
            self.register_url, 
            self.user_data, 
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, 'test@example.com')
        
    def test_user_login(self):
        # Create a user
        user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='TestPassword123!',
            first_name='Test',
            last_name='User',
            role='ATTENDEE'
        )
        
        # Login
        response = self.client.post(
            self.login_url,
            {
                'email': 'test@example.com',
                'password': 'TestPassword123!'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)
        self.assertTrue('refresh' in response.data)