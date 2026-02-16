from django.urls import path
# استيراد دالة التسجيل (Signup)
from .views.signup_view import signup_hero 
# استيراد كلاس تسجيل الدخول (Login) من الملف الذي عدلناه سابقاً
from .views.auth_views import CustomAuthToken 
# استيراد دالة الـ Profile
from .views.profile_view import user_profile
from .views.leaderboard_view import leaderboard
from .views.bank_view import manage_bank_account, get_tutor_bank_account

urlpatterns = [
    path('auth/signup/', signup_hero, name='signup_hero'),
    path('auth/login/', CustomAuthToken.as_view(), name='auth_login'),
    path('profile/', user_profile, name='user_profile'),
    path('leaderboard/', leaderboard, name='leaderboard'),
    path('tutor/bank-account/', manage_bank_account, name='manage_bank_account'),
    path('tutor/<int:tutor_id>/bank-account/', get_tutor_bank_account, name='get_tutor_bank_account'),
]