from django.urls import path
from .views import QuestionListView, SubmitQuizView

urlpatterns = [
    path('questions/', QuestionListView.as_view()),
    path('submit/', SubmitQuizView.as_view()),
]