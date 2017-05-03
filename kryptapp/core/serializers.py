from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.fields import CharField, Field, ReadOnlyField, ListField

from models import Message


class MessageGetSerializer(serializers.ModelSerializer): #Serialize incoming message to database or the other way around
    user_from = CharField(source='user_from.username')

    class Meta:
        model = Message
        fields = ('timestamp', 'chat', 'user_from', 'message_body', 'read_by')
        read_only_fields = ('read_by', 'user_from')


class MessagePostSerializer(serializers.ModelSerializer): #Serialize incoming message to database or the other way around
    user_from = CharField(source='user_from.username')

    class Meta:
        model = Message
        fields = ('chat', 'user_from', 'message_body')