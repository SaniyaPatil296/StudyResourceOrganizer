from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from resources.views import (
    CategoryViewSet,
    StudyResourceViewSet,
    StudyNoteViewSet,
)

router = DefaultRouter()

router.register("categories", CategoryViewSet)
router.register("resources", StudyResourceViewSet)
router.register("notes", StudyNoteViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]