# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-04-03 23:16
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0002_remove_message_uuid'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='read_by',
            field=models.ManyToManyField(to=settings.AUTH_USER_MODEL),
        ),
    ]