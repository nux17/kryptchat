# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-05-03 22:56
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_kryptuser_rsa_public'),
    ]

    operations = [
        migrations.AlterField(
            model_name='kryptuser',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
    ]
