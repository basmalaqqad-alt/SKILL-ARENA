from django.urls import path
# استيراد الـ Views من الملفات المنفصلة
from accounts.views.auth_views import LoginView
from accounts.views.signup_view import RegisterView

urlpatterns = [
    # Login path - For your 'admin' and 'admin2' heroes
    path('login/', LoginView.as_view(), name='login'),
    
    # Signup path - For new heroes (Learners and Tutors)
    path('register/', RegisterView.as_view(), name='register'),
]