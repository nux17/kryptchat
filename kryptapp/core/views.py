from django.contrib.auth import authenticate
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, views
from django.db import transaction
from rest_framework.response import Response
from rest_framework.views import APIView
from JWT import *

from authentication import JWTAuth

from django.conf import settings
from rest_framework.status import *
from rest_framework.parsers import FormParser, MultiPartParser

from serializers import *
from models import Message


#Returns the unread messages with a GET, add a message though POST
class MessageView(APIView):
    authentication_classes = (JWTAuth,)
    parser_classes = (FormParser, MultiPartParser)

    def get_queryset(self):
        return Message.objects.filter(chat__users__username__contains=self.request.user.username)

    def get(self, request, format=None):
        qset = Message.objects.filter(chat__users__username__contains=self.request.user.username)#.exclude(read_by=request.user)
        serializer = MessageGetSerializer(qset, many=True)
        with transaction.atomic():
            for i in qset:
                i.read_by.add(request.user)
                i.save()
        return Response(serializer.data)

    #Todo Create chat if doesn't exist, check if user is contact to prevent security issue
    def post(self, request, format=None):
        serializer = MessagePostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=HTTP_200_OK)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)



# View called to obtain a JWT
@csrf_exempt
def get_jwt_token(request):
    if request.method == 'POST':
        try: # Try auth based on given credentials
            user = authenticate(**{'username': request.POST['username'], 'password': request.POST['password']})
            if user: #Test payload
                jwt = jwtencode({'username': user.username}, "HS256", key=settings.SECRET_KEY)
                return HttpResponse(status=200, content=jwt)
            else: #Can't log in
                return HttpResponse(status=403, content="Authentication error")
        except Exception as e:
            return HttpResponse(status=400, content=e)
    return HttpResponse(status=405)
