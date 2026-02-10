from django.urls import path
from .views.auth_views import CustomAuthToken
from .views.signup_view import signup_hero
from .views.profile_view import user_profile # تأكدي من هذا الاستيراد

urlpatterns = [
    path('auth/login/', CustomAuthToken.as_view(), name='login'),
    path('auth/signup/', signup_hero, name='signup'),
    
    # هذا هو السطر اللي بيشغل الداشبورد الذهبية يا مروحة
    path('profile/', user_profile, name='user-profile'), 
]