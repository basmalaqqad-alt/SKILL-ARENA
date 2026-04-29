# backend/accounts/urls.py
# أضيف مسارات التوثيق في الأسفل

from django.urls import path
from .views.signup_view       import signup_hero
from .views.auth_views        import CustomAuthToken
from .views.profile_view      import user_profile, tutor_students
from .views.leaderboard_view  import leaderboard
from .views.bank_view         import manage_bank_account, get_tutor_bank_account
from .views.verification_view import (
    submit_verification,
    verification_status,
    admin_list_verifications,
    admin_approve_verification,
    admin_reject_verification,
)

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────
    path('auth/signup/', signup_hero,            name='signup_hero'),
    path('auth/login/',  CustomAuthToken.as_view(), name='auth_login'),

    # ── Profile & leaderboard ─────────────────────────────────────
    path('profile/',          user_profile,  name='user_profile'),
    path('leaderboard/',      leaderboard,   name='leaderboard'),
    path('tutor/my-students/', tutor_students, name='tutor_students'),

    # ── Bank account ──────────────────────────────────────────────
    path('tutor/bank-account/',               manage_bank_account,     name='manage_bank_account'),
    path('tutor/<int:tutor_id>/bank-account/', get_tutor_bank_account, name='get_tutor_bank_account'),

    # ── Verification (tutor) ──────────────────────────────────────
    path('tutor/verify/submit/', submit_verification, name='verify_submit'),
    path('tutor/verify/status/', verification_status, name='verify_status'),

    # ── Verification (admin) ──────────────────────────────────────
    path('admin/verifications/',               admin_list_verifications,   name='admin_verifications'),
    path('admin/verifications/<int:pk>/approve/', admin_approve_verification, name='admin_approve'),
    path('admin/verifications/<int:pk>/reject/',  admin_reject_verification,  name='admin_reject'),
]