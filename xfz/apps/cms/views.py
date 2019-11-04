from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.views.generic import View
from django.views.decorators.http import require_POST, require_GET
from apps.news.models import NewsCategor
from .forms import EditNewsCategoryForm, WriteNewsForm
from utils import restful
import os
from django.conf import settings
import qiniu
from apps.news.models import News


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

    def post(self, request):
        form = WriteNewsForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            desc = form.cleaned_data.get('desc')
            thumbnail = form.cleaned_data.get('thumbnail')
            content = form.cleaned_data.get('content')
            category_id = form.cleaned_data.get('category')
            category = NewsCategor.objects.get(pk=category_id)
            News.objects.create(title=title, desc=desc, thumbnail=thumbnail, content=content,
                                category=category, author=request.user)
            return restful.ok()
        else:
            return restful.params_errors(message=form.get_errors())


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
    # 获取上传的文件并保存，然后返回保存的路径url
    file = request.FILES.get('file')
    name = file.name
    with open(os.path.join(settings.MEDIA_ROOT, name), 'wb') as fp:
        for chunk in file.chunks():
            fp.write(chunk)
    url = request.build_absolute_uri(settings.MEDIA_URL + name)
    return restful.result(data={'url': url})


@require_GET
def qntoken(request):
    access_key = settings.QINIU_ACCESS_KEY
    secret_key = settings.QINIU_SECRET_KEY
    q = qiniu.Auth(access_key, secret_key)
    bucket_name = settings.QINIU_BUCKET_NAME
    token = q.upload_token(bucket=bucket_name)
    return restful.result(data={'token': token})


def banners(request):
    return render(request, 'cms/banners.html')
