from rest_framework import serializers
from .models import Category, StudyResource, StudyNote


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class StudyResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyResource
        fields = "__all__"


class StudyNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyNote
        fields = "__all__"