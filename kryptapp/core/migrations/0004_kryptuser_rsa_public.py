# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-05-03 22:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_auto_20170501_2316'),
    ]

    operations = [
        migrations.AddField(
            model_name='kryptuser',
            name='rsa_public',
            field=models.TextField(blank=True, null=True),
        ),
    ]
