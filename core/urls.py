from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from skills.views import SkillViewSet

# إعداد الراوتر اللي رح ينشئ الروابط تلقائياً
router = DefaultRouter()
router.register(r'skills', SkillViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), # هاد هو الرابط اللي رح تحتاجه بسومة
]
