"""kryptapp URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from rest_framework_jwt.views import obtain_jwt_token
from core import views


urlpatterns = [
    url(r'^admin/$', admin.site.urls),
    url(r'^login/$', views.get_jwt_token),
    url(r'^signup/$', views.signup),
    url(r'^rsa/$', views.store_rsa_key),
    url(r'^contacts/$', views.ContactView.as_view()),
    url(r'^requests/$', views.RequestView.as_view()),
    url(r'^messages/(?P<contact>.+)$', views.MessageView.as_view()),
    url(r'^messages/$', views.MessageView.as_view()),
    url(r'^get-all-messages/(?P<contact>.+)$', views.GetAllMessages.as_view()),
    url(r'^get-all-messages/$', views.GetAllMessages.as_view()),
]
