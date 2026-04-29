# backend/courses/urls.py

from django.urls import path
from . import views

urlpatterns = [

    # ── Tutor: course CRUD ────────────────────────────────────────
    path('tutor/courses/',                     views.create_course,        name='create_course'),
    path('tutor/courses/list/',                views.list_tutor_courses,   name='list_tutor_courses'),
    path('tutor/courses/<int:course_id>/',     views.delete_course,        name='delete_course'),

    # ── Tutor: sections (NEW) ─────────────────────────────────────
    path('tutor/courses/<int:course_id>/sections/',                          views.create_section, name='create_section'),
    path('tutor/courses/<int:course_id>/sections/<int:section_id>/',         views.delete_section, name='delete_section'),

    # ── Tutor: videos ─────────────────────────────────────────────
    path('tutor/courses/<int:course_id>/videos/',                            views.add_course_video,    name='add_course_video'),
    path('tutor/courses/<int:course_id>/videos/<int:video_id>/',             views.delete_course_video, name='delete_course_video'),

    # ── Tutor: materials ──────────────────────────────────────────
    path('tutor/courses/<int:course_id>/materials/',                         views.add_course_material,    name='add_course_material'),
    path('tutor/courses/<int:course_id>/materials/<int:material_id>/',       views.delete_course_material, name='delete_course_material'),

    # ── Tutor: quizzes ────────────────────────────────────────────
    path('tutor/quizzes/',                     views.create_quiz,       name='create_quiz'),
    path('tutor/quizzes/list/',                views.list_tutor_quizzes,name='list_tutor_quizzes'),
    path('tutor/quizzes/<int:quiz_id>/',       views.update_quiz,       name='update_quiz'),
    path('tutor/quizzes/<int:quiz_id>/delete/',views.delete_quiz,       name='delete_quiz'),

    # ── Learner: browse & detail ──────────────────────────────────
    path('learner/courses/',                              views.list_learner_courses,          name='list_learner_courses'),
    path('learner/courses/enrolled/',                     views.list_learner_enrolled_courses, name='list_learner_enrolled_courses'),
    path('learner/courses/<int:course_id>/',              views.course_detail,                 name='course_detail'),
    path('learner/courses/<int:course_id>/enroll/',       views.enroll_course,                 name='enroll_course'),
    path('learner/courses/<int:course_id>/complete/',     views.complete_course,               name='complete_course'),
    path('learner/courses/<int:course_id>/comments/',     views.add_course_comment,            name='add_course_comment'),
    path('learner/courses/<int:course_id>/rate/',         views.add_course_rating,             name='add_course_rating'),

    # ── Learner: quizzes ──────────────────────────────────────────
    path('learner/quizzes/',                              views.list_learner_quizzes,  name='list_learner_quizzes'),
    path('learner/quizzes/<int:quiz_id>/submit/',         views.submit_quiz_result,    name='submit_quiz_result'),
]