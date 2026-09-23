from rest_framework import generics, views, response, permissions
from .models import Question, Choice, QuizResult
from .serializers import QuestionSerializer, SubmitAnswersSerializer


class QuestionListView(generics.ListAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]


class SubmitQuizView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SubmitAnswersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        answers = serializer.validated_data['answers']

        score = 0
        total = len(answers)
        for question_id, choice_id in answers.items():
            is_correct = Choice.objects.filter(
                id=choice_id, question_id=question_id, is_correct=True
            ).exists()
            if is_correct:
                score += 1

        QuizResult.objects.create(
            user=request.user if request.user.is_authenticated else None,
            score=score,
            total=total
        )
        return response.Response({'score': score, 'total': total})