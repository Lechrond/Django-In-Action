from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.views.generic import View
from django.views.decorators.http import require_POST, require_GET
from apps.news.models import NewsCategor
from .forms import EditNewsCategoryForm
from utils import restful
import os
from django.conf import settings
import qiniu


# Create your views here.
@staff_member_required(login_url='index')
def index(request):
    return render(request, 'cms/index.html')


class WriteNewView(View):
    def get(self, request):
        categories = NewsCategor.objects.all()
        context = {
            'categories': categories
        }
        return render(request, 'cms/write_news.html', context=context)


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


@require_POST
def edit_news_category(request):
    form = EditNewsCategoryForm(request.POST)
    if form.is_valid():
        pk = form.cleaned_data.get('pk')
        name = form.cleaned_data.get('name')
        try:
            NewsCategor.objects.filter(pk=pk).update(name=name)
            return restful.ok()
        except:
            return restful.params_errors(message='该分类不存在')
    else:
        return restful.params_errors(message=form.get_error())


@require_POST
def delete_news_category(request):
    pk = request.POST.get('pk')
    try:
        NewsCategor.objects.filter(pk=pk).delete()
        return restful.ok()
    except:
        return restful.params_errors(message='该分类不存在')


@require_POST
def upload_file(request):
    file = request.FILES.get('file')
    name = file.name
    with open(os.path.join(settings.MEDIA_ROOT, name), 'wb') as fp:
        for chunk in file.chunks():
            fp.write(chunk)
    url = request.build_absolute_uri(settings.MEDIA_URL + name)
    return restful.result(data={'url': url})


@require_GET
def qntoken(request):
    access_key = 'UZq-ZUmD1CQNOLq0NVUxx3cWzGxGfeUoQfg3bDPy'
    secret_key = 'vXClBDan5GHUnjNlE3oK0yU3EjGhKjObyiNLNST2'
    q = qiniu.Auth(access_key, secret_key)
    bucket_name = 'lechace'
    token = q.upload_token(bucket=bucket_name)
    return restful.result(data={'token': token})
