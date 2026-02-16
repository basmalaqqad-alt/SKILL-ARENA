from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import BankAccount
from accounts.serializers.bank_serializers import BankAccountSerializer, BankAccountCreateSerializer


def check_tutor_role(user):
    """Helper function to check if user is a tutor"""
    return user.role == 'tutor'


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def manage_bank_account(request):
    """
    GET: جلب معلومات البنك للإنستركتور الحالي
    POST/PUT: إضافة أو تحديث معلومات البنك
    """
    if not check_tutor_role(request.user):
        return Response(
            {'error': 'Only tutors can manage bank accounts'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        try:
            bank_account = BankAccount.objects.get(tutor=request.user)
            serializer = BankAccountSerializer(bank_account)
            return Response(serializer.data)
        except BankAccount.DoesNotExist:
            return Response({'error': 'Bank account not found'}, status=status.HTTP_404_NOT_FOUND)

    elif request.method in ['POST', 'PUT']:
        serializer = BankAccountCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            bank_account = serializer.save()
            return Response(BankAccountSerializer(bank_account).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tutor_bank_account(request, tutor_id):
    """
    جلب معلومات البنك للإنستركتور (للطالب عند الدفع)
    """
    try:
        from accounts.models import User
        tutor = User.objects.get(id=tutor_id, role='tutor')
        bank_account = BankAccount.objects.get(tutor=tutor)
        # إخفاء بعض المعلومات الحساسة
        serializer = BankAccountSerializer(bank_account)
        data = serializer.data
        # إخفاء رقم الحساب الكامل، نعرض فقط آخر 4 أرقام
        if data.get('account_number'):
            account_num = data['account_number']
            if len(account_num) > 4:
                data['account_number'] = '*' * (len(account_num) - 4) + account_num[-4:]
        return Response(data)
    except User.DoesNotExist:
        return Response({'error': 'Tutor not found'}, status=status.HTTP_404_NOT_FOUND)
    except BankAccount.DoesNotExist:
        return Response({'error': 'Bank account not found for this tutor'}, status=status.HTTP_404_NOT_FOUND)
