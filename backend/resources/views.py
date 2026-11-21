
from rest_framework import viewsets
from .models import Category, StudyResource, StudyNote
from .serializers import (
    CategorySerializer,
    StudyResourceSerializer,
    StudyNoteSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class StudyResourceViewSet(viewsets.ModelViewSet):
    serializer_class = StudyResourceSerializer

    def get_queryset(self):
        return StudyResource.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class StudyNoteViewSet(viewsets.ModelViewSet):
    serializer_class = StudyNoteSerializer

    def get_queryset(self):
        return StudyNote.objects.filter(
            resource__owner=self.request.user
        )
