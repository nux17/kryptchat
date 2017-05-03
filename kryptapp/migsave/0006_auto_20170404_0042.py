# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-04-04 00:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_auto_20170404_0041'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chat',
            name='uuid',
            field=models.UUIDField(auto_created=True, unique=True),
        ),
        migrations.AlterField(
            model_name='message',
            name='uuid',
            field=models.UUIDField(auto_created=True, unique=True),
        ),
    ]
