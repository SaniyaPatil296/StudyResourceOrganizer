
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, StudyResource, StudyNote


class ResourceAPITests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="student1",
            password="Student@2026"
        )

        self.user2 = User.objects.create_user(
            username="student2",
            password="Student@2026"
        )

        self.category = Category.objects.create(
            owner=self.user1,
            name="Python",
            description="Python learning resources"
        )

        self.resource = StudyResource.objects.create(
            owner=self.user1,
            category=self.category,
            title="Python Tutorial",
            url="https://www.python.org/",
            description="Official Python tutorial"
        )

        self.note = StudyNote.objects.create(
            resource=self.resource,
            content="Learn Python basics"
        )

    def test_api_requires_authentication(self):
        response = self.client.get("/api/categories/")

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_user_can_view_own_categories(self):
        self.client.force_authenticate(user=self.user1)

        response = self.client.get("/api/categories/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Python")

    def test_user_cannot_view_other_users_categories(self):
        self.client.force_authenticate(user=self.user2)

        response = self.client.get("/api/categories/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_user_can_create_category(self):
        self.client.force_authenticate(user=self.user1)

        data = {
            "name": "React",
            "description": "React learning resources"
        }

        response = self.client.post(
            "/api/categories/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["owner"], self.user1.id)

    def test_user_can_create_resource(self):
        self.client.force_authenticate(user=self.user1)

        data = {
            "title": "Django Tutorial",
            "url": "https://www.djangoproject.com/",
            "description": "Django learning resource",
            "category": self.category.id
        }

        response = self.client.post(
            "/api/resources/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["owner"], self.user1.id)

    def test_user_cannot_use_other_users_category(self):
        self.client.force_authenticate(user=self.user2)

        data = {
            "title": "Unauthorized Resource",
            "url": "https://www.python.org/",
            "description": "Testing category ownership",
            "category": self.category.id
        }

        response = self.client.post(
            "/api/resources/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_cannot_use_other_users_resource_for_note(self):
        self.client.force_authenticate(user=self.user2)

        data = {
            "resource": self.resource.id,
            "content": "Unauthorized note"
        }

        response = self.client.post(
            "/api/notes/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_can_create_note(self):
        self.client.force_authenticate(user=self.user1)

        data = {
            "resource": self.resource.id,
            "content": "Important Python concepts"
        }

        response = self.client.post(
            "/api/notes/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_cannot_view_other_users_notes(self):
        self.client.force_authenticate(user=self.user2)

        response = self.client.get("/api/notes/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_user_can_delete_own_note(self):
        self.client.force_authenticate(user=self.user1)

        response = self.client.delete(
            f"/api/notes/{self.note.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            StudyNote.objects.filter(id=self.note.id).exists()
        )

