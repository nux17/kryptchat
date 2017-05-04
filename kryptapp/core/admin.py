from django.contrib import admin

# Register your models here.


from .models import *


class MessageAdmin(admin.ModelAdmin):
    pass

class UserAdmin(admin.ModelAdmin):
    pass

admin.site.register(KryptUser, UserAdmin)
admin.site.register(Message, MessageAdmin)