from rest_framework import serializers
from accounts.models import BankAccount


class BankAccountSerializer(serializers.ModelSerializer):
    tutor_username = serializers.CharField(source='tutor.username', read_only=True)

    class Meta:
        model = BankAccount
        fields = [
            'id', 'tutor_username', 'bank_name', 'account_number',
            'account_holder_name', 'iban', 'swift_code', 'branch_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['tutor', 'created_at', 'updated_at']


class BankAccountCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = [
            'bank_name', 'account_number', 'account_holder_name',
            'iban', 'swift_code', 'branch_name'
        ]

    def create(self, validated_data):
        tutor = self.context['request'].user
        bank_account, created = BankAccount.objects.update_or_create(
            tutor=tutor,
            defaults=validated_data
        )
        return bank_account
