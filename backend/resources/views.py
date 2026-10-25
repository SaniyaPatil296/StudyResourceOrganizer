from rest_framework import viewsets
from .models import Category, StudyResource, StudyNote
from .serializers import (
    CategorySerializer,
    StudyResourceSerializer,
    StudyNoteSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class StudyResourceViewSet(viewsets.ModelViewSet):
    queryset = StudyResource.objects.all()
    serializer_class = StudyResourceSerializer


class StudyNoteViewSet(viewsets.ModelViewSet):
    queryset = StudyNote.objects.all()
    serializer_class = StudyNoteSerializer