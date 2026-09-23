from django.contrib import admin
from .models import Question, Choice, QuizResult


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 4  # сразу 4 пустых поля под варианты, как в вашем test.html


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'text', 'order']
    inlines = [ChoiceInline]


@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'score', 'total', 'created_at']