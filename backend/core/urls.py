from django.contrib import admin
from django.urls import path, include
# يجب استيراد الكلاس من المكان الذي قمتِ بتعريفه فيه
from accounts.views.auth_views import CustomAuthToken 

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # الخيار الأفضل: تضمين روابط تطبيق الحسابات بالكامل
    path('api/accounts/', include('accounts.urls')), 
    
    # روابط تطبيق الكورسات (الفيديوهات والكويزات)
    path('api/', include('courses.urls')),
    
    # أو إذا أردتِ ترك الرابط كما هو، يجب التأكد من الاستيراد أعلاه:
    # path('auth/login/', CustomAuthToken.as_view(), name='auth_login'),
]

# إضافة مسار الميديا في وضع التطوير
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)