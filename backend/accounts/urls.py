from django.urls import path
# استيراد دالة التسجيل (Signup)
from .views.signup_view import signup_hero 
# استيراد كلاس تسجيل الدخول (Login) من الملف الذي عدلناه سابقاً
from .views.auth_views import CustomAuthToken 

urlpatterns = [
    # رابط التسجيل
    path('auth/signup/', signup_hero, name='signup_hero'),
    
    # رابط تسجيل الدخول - تأكدي أن هذا المسار يطابق ما يطلبه React
    path('auth/login/', CustomAuthToken.as_view(), name='auth_login'),
]