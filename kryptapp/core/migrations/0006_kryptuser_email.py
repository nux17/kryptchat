# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-05-03 23:14
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_auto_20170503_2256'),
    ]

    operations = [
        migrations.AddField(
            model_name='kryptuser',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
    ]