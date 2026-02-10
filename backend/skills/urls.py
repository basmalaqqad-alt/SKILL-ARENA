from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import SkillViewSet

router = DefaultRouter()
router.register(r'skills', SkillViewSet)

# هنا نساوي المسارات بالراوتر مباشرة لقطع الحلقة المفرغة
urlpatterns = router.urls