from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.views.generic import View
from django.views.decorators.http import require_POST, require_GET
from apps.news.models import NewsCategor
from utils import restful


# Create your views here.
@staff_member_required(login_url='index')
def index(request):
    return render(request, 'cms/index.html')


class WriteNewView(View):
    def get(self, request):
        return render(request, 'cms/write_news.html')


@require_GET
def news_category(request):
    categories = NewsCategor.objects.all()
    context = {
        'categories': categories
    }
    return render(request, 'cms/news_category.html', context=context)


@require_POST
def add_news_category(request):
    name = request.POST.get('name')
    exists = NewsCategor.objects.filter(name=name).exists()
    if not exists:
        NewsCategor.objects.create(name=name)
        return restful.ok()
    else:
        return restful.params_errors(message='该分类已经存在')
