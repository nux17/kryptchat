from django.contrib import admin

# Register your models here.


from .models import Chat, Message


class ChatAdmin(admin.ModelAdmin):
    pass


class MessageAdmin(admin.ModelAdmin):
    pass


admin.site.register(Chat, ChatAdmin)
admin.site.register(Message, MessageAdmin)