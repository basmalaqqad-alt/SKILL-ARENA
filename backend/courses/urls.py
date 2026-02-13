from django.urls import path
from . import views

urlpatterns = [
    # Tutor course endpoints (رفع الفيديو = إنشاء كورس)
    path('tutor/courses/', views.create_course, name='create_course'),  # POST
    path('tutor/courses/list/', views.list_tutor_courses, name='list_tutor_courses'),  # GET
    path('tutor/courses/<int:course_id>/', views.delete_course, name='delete_course'),  # DELETE
    
    # Learner course endpoints
    path('learner/courses/', views.list_learner_courses, name='list_learner_courses'),
    path('learner/courses/<int:course_id>/', views.course_detail, name='course_detail'),
    path('learner/courses/<int:course_id>/enroll/', views.enroll_course, name='enroll_course'),
    path('learner/courses/<int:course_id>/comments/', views.add_course_comment, name='add_course_comment'),
    path('learner/courses/<int:course_id>/rate/', views.add_course_rating, name='add_course_rating'),
    
    # Tutor quiz endpoints
    path('tutor/quizzes/', views.create_quiz, name='create_quiz'),  # POST
    path('tutor/quizzes/list/', views.list_tutor_quizzes, name='list_tutor_quizzes'),  # GET
    path('tutor/quizzes/<int:quiz_id>/', views.update_quiz, name='update_quiz'),  # PUT
    path('tutor/quizzes/<int:quiz_id>/delete/', views.delete_quiz, name='delete_quiz'),  # DELETE
    
    # Learner quiz endpoints
    path('learner/quizzes/', views.list_learner_quizzes, name='list_learner_quizzes'),
]
