from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
# التأكد من المسار الصحيح للـ Serializer
from ..serializers.profile_serializers import ProfileSerializer 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    # نجهز البيانات الحقيقية لبطولتك يا مروحة
    hero_data = {
        'username': request.user.username, # بيسحب اسمك marwah
        'stats': {
            'level': 12,
            'experience': 1250,
            'quests_completed': 4
        },
        'badges': ['Shield', 'Lightning']
    }
    
    serializer = ProfileSerializer(hero_data)
    return Response(serializer.data)