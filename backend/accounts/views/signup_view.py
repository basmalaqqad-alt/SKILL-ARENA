from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
# Import the specific serializer for signup
from accounts.serializers.signup_serializers import RegisterSerializer

class RegisterView(APIView):
    """
    API View to handle new hero registration in SkillArena.
    Supports both Learner and Tutor roles.
    """
    # Allow any user to access the registration endpoint
    permission_classes = [AllowAny]

    def post(self, request):
        # Initialize serializer with request data and files (for tutor certificates)
        serializer = RegisterSerializer(data=request.data)
        
        # Validate data: checks for unique username/email, password strength, and file types
        if serializer.is_valid():
            # Save the new user to the database if all conditions are met
            user = serializer.save()
            
            # Return a success message with the new user's information
            return Response({
                "message": f"Welcome Hero {user.username}! You have joined SkillArena successfully.",
                "user_id": user.id,
                "username": user.username
            }, status=status.HTTP_201_CREATED)
        
        # If validation fails, return the specific errors to the frontend
        # Examples: 'This username is already taken' or 'Only PDF allowed'
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)