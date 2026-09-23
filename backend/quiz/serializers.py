from rest_framework import serializers
from .models import Question, Choice, QuizResult


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text']  # is_correct НЕ отдаём — иначе тест теряет смысл


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'choices']


class SubmitAnswersSerializer(serializers.Serializer):
    answers = serializers.DictField(child=serializers.IntegerField())
    # формат: {"question_id": choice_id, ...}