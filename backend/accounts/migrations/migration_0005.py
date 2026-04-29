# backend/accounts/migrations/0005_verification_request.py
# Run: python manage.py migrate

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_add_bank_account'),
    ]

    operations = [
        migrations.CreateModel(
            name='VerificationRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True)),
                ('tutor', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='verification_request',
                    to=settings.AUTH_USER_MODEL,
                    limit_choices_to={'role': 'tutor'},
                )),
                # الملف المرفوع (PDF أو صورة)
                ('document', models.FileField(upload_to='verifications/')),
                # نوع الشهادة
                ('credential_type', models.CharField(
                    max_length=50,
                    choices=[
                        ('bachelor', "Bachelor's Degree"),
                        ('master',   "Master's Degree"),
                        ('phd',      'PhD / Doctorate'),
                        ('professional', 'Professional Certificate'),
                        ('other',    'Other'),
                    ],
                )),
                # الجامعة / المؤسسة
                ('institution', models.CharField(max_length=300)),
                # سنة التخرج
                ('graduation_year', models.PositiveSmallIntegerField()),
                # التخصص
                ('field_of_study', models.CharField(max_length=300)),
                # حالة الطلب
                ('status', models.CharField(
                    max_length=20,
                    choices=[
                        ('pending',  'Pending Review'),
                        ('approved', 'Approved'),
                        ('rejected', 'Rejected'),
                    ],
                    default='pending',
                )),
                # ملاحظة الأدمن عند الرفض
                ('admin_note', models.TextField(blank=True)),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('reviewed_at',  models.DateTimeField(null=True, blank=True)),
            ],
            options={'ordering': ['-submitted_at']},
        ),
    ]