
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class StudyResource(models.Model):
    title = models.CharField(max_length=200)
    url = models.URLField()
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="resources"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class StudyNote(models.Model):
    resource = models.ForeignKey(
        StudyResource,
        on_delete=models.CASCADE,
        related_name="notes"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Note for {self.resource.title}"
