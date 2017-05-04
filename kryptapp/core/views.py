from django.contrib.auth import authenticate
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, views
from django.db import transaction
from rest_framework.decorators import authentication_classes, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from JWT import *

from authentication import JWTAuth

from django.conf import settings
from rest_framework.status import *
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from serializers import *
from models import *


#Returns the unread messages with a GET, add a message though POST
class MessageView(APIView):
    authentication_classes = (JWTAuth,)
    parser_classes = (FormParser, MultiPartParser, JSONParser)

    def get_queryset(self):
        return Message.objects.filter(user_to=self.request.user)

    def get(self, request, format=None):
        qset = Message.objects.filter(user_to=self.request.user, read=False)#.exclude(read_by=request.user)
        serializer = MessageSerializer(qset, many=True)
        with transaction.atomic():
            for i in qset:
                i.read = True
                i.save()
        return Response(serializer.data)

    def post(self, request, format=None):
        request.data['user_from'] = request.user.id
        #if KryptUser.objects.get(username=request.data['user_to']) not in request.user.contacts.all():
        #    return Response(status=HTTP_403_FORBIDDEN)
        request.data['user_to'] = KryptUser.objects.get(username=request.data['user_to']).id
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=HTTP_200_OK)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class GetAllMessages(APIView):
    authentication_classes = (JWTAuth,)

    def get(self, request, format=None):
        qset = Message.objects.filter(user_to=self.request.user.id)
        serializer = MessageSerializer(qset, many=True)
        with transaction.atomic():
            for i in qset:
                i.read = True
                i.save()
        return Response(serializer.data)


class ContactView(APIView):
    authentication_classes = (JWTAuth,)
    parser_classes = (FormParser, MultiPartParser, JSONParser)

    def get_queryset(self):
        return self.request.user.contacts

    def get(self, request, format=None):
        qset = self.get_queryset()
        serializer = ContactSerializer(qset, many=True)
        return Response(serializer.data)

    def delete(self, request, format=None): #id: user ID to delete
        try:
            self.request.user.contacts.remove(KryptUser.objects.get(id=request.data['id']))
            KryptUser.objects.get(id=request.data['id']).contacts.remove(self.request.user)
            return Response(status=HTTP_200_OK)
        except Exception as e:
            return Response(status=HTTP_400_BAD_REQUEST)

    def post(self, request, format=None): #id: user ID to accept request
        try:
            contact = KryptUser.objects.get(id=request.data['id'])
            if contact in self.request.user.contacts_request.all(): #Check if contact sent a request
                self.request.user.contacts_request.remove(contact)
                self.request.user.contacts.add(contact)
                contact.contacts.add(self.request.user)
                return Response(status=HTTP_200_OK)
            else:
                return Response(status=HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response(status=HTTP_400_BAD_REQUEST)

class RequestView(APIView):
    authentication_classes = (JWTAuth,)
    parser_classes = (FormParser, MultiPartParser, JSONParser)

    def get_queryset(self):
        return self.request.user.contacts_request

    def get(self, request,format=None): #Get pending requests
        qset = self.get_queryset()
        serializer = ContactSerializer(qset, many=True)
        return Response(serializer.data)

    def post(self, request, format=None): #Request a contact username: contact username
        contact = request.data['username']
        try:
            KryptUser.objects.get(username=contact).contacts_request.add(self.request.user)
        except Exception as e:
            return Response(status=HTTP_404_NOT_FOUND, data="Contact not found")
        return Response(status=HTTP_200_OK)

# View called to obtain a JWT
@csrf_exempt
def get_jwt_token(request):
    if request.method == 'POST':
        try: # Try auth based on given credentials
            user = authenticate(**{'username': request.POST['username'], 'password': request.POST['password']})
            if user: #Test payload
                jwt = jwtencode({'user': str(user.id)}, "HS256", key=settings.SECRET_KEY)
                return HttpResponse(status=200, content=jwt)
            else: #Can't log in
                return HttpResponse(status=404, content="Authentication error")
        except Exception as e:
            return HttpResponse(status=400, content=e)
    return HttpResponse(status=405)


@csrf_exempt
def signup(request):
    try:
        if request.method == 'POST':
            user = KryptUser.objects.create_user(request.POST['username'], date_of_birth=None, password=request.POST['password'])
            jwt = jwtencode({'user': str(user.id)}, "HS256", key=settings.SECRET_KEY)
            return HttpResponse(status=201, content=jwt)
        else:
            return HttpResponse(status=405)
    except Exception as e:
        return HttpResponse(status=400, content=e)


@api_view(['POST'])
@authentication_classes([JWTAuth])
def store_rsa_key(request):
    request.user.rsa_public = request.POST['rsa']
    request.user.save()
    return HttpResponse(status=200)