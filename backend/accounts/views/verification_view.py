# backend/accounts/views/verification_view.py
"""
Verification endpoints:

  POST   /api/accounts/tutor/verify/submit/   → tutor submits credential
  GET    /api/accounts/tutor/verify/status/   → tutor checks their status
  GET    /api/accounts/admin/verifications/   → admin lists all pending
  POST   /api/accounts/admin/verifications/<id>/approve/  → admin approves
  POST   /api/accounts/admin/verifications/<id>/reject/   → admin rejects
"""

from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

# ── Import the model (add it to accounts/models.py first) ─────────
# from ..models import VerificationRequest
# For now we use a lazy import so the file works before migration:
def _get_model():
    from django.apps import apps
    return apps.get_model('accounts', 'VerificationRequest')


# ════════════════════════════════════════════════════════════════════
#  TUTOR endpoints
# ════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def submit_verification(request):
    """
    Tutor submits their credential document for admin review.
    Accepts multipart/form-data with:
      - document        (file — PDF or image)
      - credential_type (bachelor / master / phd / professional / other)
      - institution     (string)
      - graduation_year (integer)
      - field_of_study  (string)
    """
    user = request.user
    if user.role != 'tutor':
        return Response({'error': 'Only tutors can submit credentials.'}, status=403)

    VerificationRequest = _get_model()

    # ── Validate required fields ──────────────────────────────────
    doc  = request.FILES.get('document')
    ctype = request.data.get('credential_type', '').strip()
    inst  = request.data.get('institution', '').strip()
    year  = request.data.get('graduation_year', '').strip()
    field = request.data.get('field_of_study', '').strip()

    if not doc:
        return Response({'error': 'Please upload your credential document (PDF or image).'}, status=400)
    if not ctype:
        return Response({'error': 'Please select the credential type.'}, status=400)
    if not inst:
        return Response({'error': 'Please enter the issuing institution.'}, status=400)
    if not year or not year.isdigit():
        return Response({'error': 'Please enter a valid graduation year.'}, status=400)
    if not field:
        return Response({'error': 'Please enter your field of study.'}, status=400)

    # ── Validate file type ────────────────────────────────────────
    allowed_mime = {'application/pdf', 'image/jpeg', 'image/png', 'image/jpg'}
    allowed_ext  = {'.pdf', '.jpg', '.jpeg', '.png'}
    import os
    ext = os.path.splitext(doc.name)[1].lower()
    if ext not in allowed_ext:
        return Response({'error': 'Only PDF, JPG, or PNG files are accepted.'}, status=400)

    # ── Validate file size (max 10 MB) ────────────────────────────
    if doc.size > 10 * 1024 * 1024:
        return Response({'error': 'File size must not exceed 10 MB.'}, status=400)

    # ── Create or update the request ─────────────────────────────
    vr, created = VerificationRequest.objects.update_or_create(
        tutor=user,
        defaults={
            'document':        doc,
            'credential_type': ctype,
            'institution':     inst,
            'graduation_year': int(year),
            'field_of_study':  field,
            'status':          'pending',
            'admin_note':      '',
            'reviewed_at':     None,
        },
    )

    return Response({
        'message': 'Your credential has been submitted for review. '
                   'You will be notified once the admin reviews it.',
        'status':  'pending',
        'id':      vr.id,
    }, status=201 if created else 200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verification_status(request):
    """
    Returns the current verification status for the logged-in tutor.
    """
    user = request.user
    if user.role != 'tutor':
        return Response({'error': 'Only tutors can check verification status.'}, status=403)

    VerificationRequest = _get_model()
    try:
        vr = VerificationRequest.objects.get(tutor=user)
        return Response({
            'submitted':       True,
            'status':          vr.status,          # pending / approved / rejected
            'credential_type': vr.credential_type,
            'institution':     vr.institution,
            'graduation_year': vr.graduation_year,
            'field_of_study':  vr.field_of_study,
            'admin_note':      vr.admin_note,
            'submitted_at':    vr.submitted_at,
            'reviewed_at':     vr.reviewed_at,
        })
    except VerificationRequest.DoesNotExist:
        return Response({'submitted': False, 'status': None})


# ════════════════════════════════════════════════════════════════════
#  ADMIN endpoints
# ════════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_list_verifications(request):
    """
    Returns all verification requests (default: pending only).
    Query param ?status=all  to see every request.
    """
    VerificationRequest = _get_model()
    qs = VerificationRequest.objects.select_related('tutor').order_by('-submitted_at')

    filter_status = request.query_params.get('status', 'pending')
    if filter_status != 'all':
        qs = qs.filter(status=filter_status)

    data = []
    for vr in qs:
        data.append({
            'id':              vr.id,
            'tutor_id':        vr.tutor.id,
            'tutor_username':  vr.tutor.username,
            'tutor_email':     vr.tutor.email,
            'credential_type': vr.credential_type,
            'institution':     vr.institution,
            'graduation_year': vr.graduation_year,
            'field_of_study':  vr.field_of_study,
            'document_url':    request.build_absolute_uri(vr.document.url) if vr.document else None,
            'status':          vr.status,
            'admin_note':      vr.admin_note,
            'submitted_at':    vr.submitted_at,
            'reviewed_at':     vr.reviewed_at,
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_approve_verification(request, pk):
    """
    Admin approves a verification request.
    Sets tutor.certificate field so is_trusted_tutor becomes True.
    """
    VerificationRequest = _get_model()
    try:
        vr = VerificationRequest.objects.select_related('tutor').get(pk=pk)
    except VerificationRequest.DoesNotExist:
        return Response({'error': 'Verification request not found.'}, status=404)

    # Mark as approved
    vr.status      = 'approved'
    vr.admin_note  = request.data.get('note', '')
    vr.reviewed_at = timezone.now()
    vr.save()

    # Set tutor.certificate so is_trusted_tutor property returns True
    tutor = vr.tutor
    tutor.certificate = vr.document  # re-use the same uploaded file
    tutor.save(update_fields=['certificate'])

    return Response({'message': f'{tutor.username} has been verified successfully.'})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_reject_verification(request, pk):
    """
    Admin rejects a verification request with an optional reason.
    """
    VerificationRequest = _get_model()
    try:
        vr = VerificationRequest.objects.select_related('tutor').get(pk=pk)
    except VerificationRequest.DoesNotExist:
        return Response({'error': 'Verification request not found.'}, status=404)

    vr.status      = 'rejected'
    vr.admin_note  = request.data.get('note', 'Your credential could not be verified.')
    vr.reviewed_at = timezone.now()
    vr.save()

    # Remove certificate so is_trusted_tutor becomes False again
    tutor = vr.tutor
    tutor.certificate = None
    tutor.save(update_fields=['certificate'])

    return Response({'message': f'{vr.tutor.username} verification has been rejected.'})