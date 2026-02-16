from rest_framework import serializers


class ProfileSerializer(serializers.Serializer):
    username = serializers.CharField()
    avatar_url = serializers.CharField(allow_null=True)
    experience = serializers.IntegerField()
    arena_coins = serializers.IntegerField()
    rank_name = serializers.CharField()
    progress_percentage = serializers.IntegerField()
    stats = serializers.DictField(child=serializers.IntegerField())
    badges = serializers.ListField(child=serializers.CharField())
    in_progress_courses = serializers.ListField()
    completed_courses = serializers.ListField()
    is_trusted_tutor = serializers.BooleanField(required=False)