

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from resources.views import (
    CategoryViewSet,
    StudyResourceViewSet,
    StudyNoteViewSet,
)

router = DefaultRouter()

router.register("categories", CategoryViewSet, basename="category")
router.register("resources", StudyResourceViewSet, basename="studyresource")
router.register("notes", StudyNoteViewSet, basename="studynote")

urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication APIs
    path("api/auth/", include("accounts.urls")),

    # Existing study resource APIs
    path("api/", include(router.urls)),
]

