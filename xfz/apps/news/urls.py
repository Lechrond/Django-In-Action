from django.urls import path
from . import views

app_name = 'news'

urlpatterns = [
    path('<news_id>/', views.news_detail, name='news_detail'),
]
