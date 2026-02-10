from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # هاد السطر بيخلي روابط الـ accounts تبدأ بـ api/accounts/
    path('api/accounts/', include('accounts.urls')), 
]