from django.shortcuts import render
from .models import News, NewsCategor
from django.conf import settings
from utils import restful
from .serializers import NewsSerializer
from django.http import Http404
from django.db import connection


# Create your views here.
def index(request):
    count = settings.ONE_PAGE_NEWS_COUNT
    # 优化查询
    newses = News.objects.select_related('category', 'author').all()[0:count]
    categories = NewsCategor.objects.all()
    context = {
        'newses': newses,
        'categories': categories,
    }
    return render(request, 'news/index.html', context=context)


def news_list(request):
    # 获取某一页的新闻列表
    page = int(request.GET.get('p', 1))
    # 分类为0就是最新资讯
    category_id = int(request.GET.get('category_id', 0))
    # 设置每次取出多少数据
    start = (page - 1) * settings.ONE_PAGE_NEWS_COUNT
    end = start + settings.ONE_PAGE_NEWS_COUNT
    # 判断属于哪一类新闻
    if category_id == 0:
        newses = News.objects.select_related('category', 'author').all()[start:end]
    else:
        newses = News.objects.select_related('category', 'author').filter(category_id=category_id)[
                 start:end]
    serializer = NewsSerializer(newses, many=True)
    data = serializer.data
    return restful.result(data=data)


def news_detail(request, news_id):
    try:
        news = News.objects.select_related('category', 'author').get(pk=news_id)
        context = {
            'news': news
        }
        return render(request, 'news/news_detail.html', context=context)
    except:
        raise Http404


def search(request):
    return render(request, 'search/search.html')
