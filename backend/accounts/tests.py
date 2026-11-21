
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


class AuthenticationTests(APITestCase):

    def test_user_registration(self):
        data = {
            "username": "newstudent",
            "email": "newstudent@example.com",
            "password": "Student@2026"
        }

        response = self.client.post(
            "/api/auth/register/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            User.objects.filter(username="newstudent").exists()
        )

    def test_user_login(self):
        User.objects.create_user(
            username="teststudent",
            email="teststudent@example.com",
            password="Student@2026"
        )

        data = {
            "username": "teststudent",
            "password": "Student@2026"
        }

        response = self.client.post(
            "/api/auth/login/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_with_invalid_password(self):
        User.objects.create_user(
            username="teststudent",
            password="Student@2026"
        )

        data = {
            "username": "teststudent",
            "password": "WrongPassword"
        }

        response = self.client.post(
            "/api/auth/login/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
