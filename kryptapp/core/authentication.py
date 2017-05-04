from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework_jwt.serializers import User
from rest_framework import exceptions
from django.contrib.auth.models import User as DjUser

from JWT import jwtdecode

from django.conf import settings


# DRF Auth class based on JWT validation
class JWTAuth(BaseAuthentication):
    def authenticate(self, request):
        jwt = get_authorization_header(request)
        if not jwt: #Check if sent JWT is sent
            return None
        try: #Check if JWT is valid
            decoded = jwtdecode(jwt, "HS256", key=settings.SECRET_KEY)
            return User.objects.get(id=decoded['user']), jwt  # Return logged in user
        except Exception as e:
            raise exceptions.AuthenticationFailed('Authentication failed') # Failed auth
