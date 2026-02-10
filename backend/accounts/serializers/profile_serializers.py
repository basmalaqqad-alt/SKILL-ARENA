from rest_framework import serializers

# السيريالايزر المسؤول عن تحويل بيانات بطلتنا مروحة إلى تنسيق JSON
class ProfileSerializer(serializers.Serializer):
    # الحقول الأساسية للملف الشخصي
    username = serializers.CharField()
    
    # حقل الإحصائيات (Stats) كقاموس يحتوي على أرقام (Level, Experience, Quests)
    stats = serializers.DictField(
        child=serializers.IntegerField()
    )
    
    # حقل الأوسمة (Badges) كقائمة تحتوي على نصوص (Shield, Lightning)
    badges = serializers.ListField(
        child=serializers.CharField()
    )

    # دالة اختيارية في حال أردتِ إضافة حقول إضافية مستقبلاً
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # يمكنكِ إضافة منطق برمجي هنا لتعديل البيانات قبل إرسالها للواجهة
        return representation