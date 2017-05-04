from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.fields import CharField, Field, ReadOnlyField, ListField

from models import *


class MessageSerializer(serializers.ModelSerializer): #Serialize incoming message to database or the other way around
    user_from_name = CharField(source='user_from.username', read_only=True)
    user_to_name = CharField(source='user_to.username', read_only=True)

    class Meta:
        model = Message
        fields = ('timestamp', 'user_from_name', 'user_from', 'user_to', 'user_to_name', 'message_body', 'read')
        read_only_fields = ('read', 'timestamp')


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = KryptUser
        fields = ('username', 'id')