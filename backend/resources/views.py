
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone
from rest_framework import viewsets

from .models import Category, StudyResource, StudyNote
from .serializers import (
    CategorySerializer,
    StudyResourceSerializer,
    StudyNoteSerializer,
)


def send_study_notification(user_id, message, event_name):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"study_notifications_{user_id}",
        {
            "type": "notification.message",
            "data": {
                "event": event_name,
                "message": message,
                "timestamp": timezone.now().isoformat(),
            },
        },
    )


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        category = serializer.save(owner=self.request.user)

        send_study_notification(
            self.request.user.id,
            f"New category created: {category.name}",
            "category_created",
        )


class StudyResourceViewSet(viewsets.ModelViewSet):
    serializer_class = StudyResourceSerializer

    def get_queryset(self):
        return StudyResource.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        resource = serializer.save(owner=self.request.user)

        send_study_notification(
            self.request.user.id,
            f"New study resource added: {resource.title}",
            "resource_created",
        )


class StudyNoteViewSet(viewsets.ModelViewSet):
    serializer_class = StudyNoteSerializer

    def get_queryset(self):
        return StudyNote.objects.filter(
            resource__owner=self.request.user
        )

    def perform_create(self, serializer):
        note = serializer.save()

        send_study_notification(
            self.request.user.id,
            f"New study note added for: {note.resource.title}",
            "note_created",
        )
