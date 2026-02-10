from django.urls import path
# الاستيراد من المسار المنظم الجديد (مجلد views ثم ملف auth_views)
from accounts.views.auth_views import LoginView 

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
]