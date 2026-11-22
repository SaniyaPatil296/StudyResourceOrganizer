
from django.urls import path

from .consumers import StudyNotificationConsumer


websocket_urlpatterns = [
    path(
        "ws/notifications/",
        StudyNotificationConsumer.as_asgi()
    ),
]
