from __future__ import unicode_literals

from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
# Create your models here.
from django.dispatch import receiver
import uuid


class Message(models.Model):
    uuid_id = models.UUIDField(auto_created=True, unique=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField('timestamp', editable=False, auto_now_add=True)
    chat = models.ForeignKey('Chat', related_name='messages')
    user_from = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='messages')
    message_body = models.TextField()
    read_by = models.ManyToManyField(settings.AUTH_USER_MODEL)


class Chat(models.Model):
    uuid_id = models.UUIDField(auto_created=True, unique=True, default=uuid.uuid4, editable=False)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL)


class UserManager(BaseUserManager):
    def create_user(self, username, date_of_birth=None, password=None):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """

        user = self.model(
            username=username,
            date_of_birth=date_of_birth,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, date_of_birth=None):
        """
        Creates and saves a superuser with the given email, date of
        birth and password.
        """
        user = self.create_user(
            username,
            password=password,
            date_of_birth=date_of_birth,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user


class KryptUser(AbstractBaseUser):
    username = models.CharField(
        max_length=64,
        unique=True,
    )
    date_of_birth = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    contacts = models.ManyToManyField('KryptUser', related_name='added_by')
    contacts_request = models.ManyToManyField('KryptUser', related_name='requests')

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def get_full_name(self):
        # The user is identified by their email address
        return self.email

    def get_short_name(self):
        # The user is identified by their email address
        return self.email

    def __str__(self):              # __unicode__ on Python 2
        return self.email

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin