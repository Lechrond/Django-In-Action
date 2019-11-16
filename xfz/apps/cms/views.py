from django.shortcuts import render, reverse, redirect
from django.contrib.admin.views.decorators import staff_member_required
from django.views.generic import View
from django.views.decorators.http import require_POST, require_GET
from apps.news.models import NewsCategor, Banner
from .forms import EditNewsCategoryForm, WriteNewsForm, AddBannerForm, EditBannerForm, EditNewsForm, \
    PubCourseForm
from utils import restful
import os
from django.conf import settings
import qiniu
from apps.news.models import News
from apps.news.serializers import BannerSerializer
from django.core.paginator import Paginator
from datetime import datetime
from django.utils.timezone import make_aware
from urllib import parse
from apps.course.models import Course, CourseCategory, Teacher
from apps.xfzauth.models import User
from django.contrib.auth.models import Group
from apps.xfzauth.decorators import xfz_superuser_required
from django.utils.decorators import method_decorator


# Create your views here.
@staff_member_required(login_url='index')
def index(request):
    return render(request, 'cms/index.html')


class WriteNewsView(View):
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


class EditNewsView(View):
    def get(self, request):
        news_id = int(request.GET.get("news_id"))
        news = News.objects.get(pk=news_id)
        context = {
            'news': news,
            'categories': NewsCategor.objects.all()
        }
        return render(request, 'cms/write_news.html', context=context)

    def post(self, request):
        form = EditNewsForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            desc = form.cleaned_data.get('desc')
            thumbnail = form.cleaned_data.get('thumbnail')
            content = form.cleaned_data.get('content')
            category_id = form.cleaned_data.get('category')
            category = NewsCategor.objects.get(pk=category_id)
            pk = form.cleaned_data.get('pk')
            News.objects.filter(pk=pk).update(title=title, desc=desc, thumbnail=thumbnail,
                                              content=content, category=category)
            return restful.ok()
        else:
            return restful.params_errors(message=form.get_errors())


@require_POST
def delete_news(request):
    news_id = request.POST.get('news_id')
    News.objects.filter(pk=news_id).delete()
    return restful.ok()


class NewsListView(View):
    def get(self, request):
        # 获取第几页的数据
        page_index = int(request.GET.get('p', 1))
        start = request.GET.get('start')
        end = request.GET.get('end')
        title = request.GET.get('title')
        category_id = int(request.GET.get('category', 0) or 0)
        # 新闻
        newses = News.objects.select_related('category', 'author')

        if start or end:
            # 如果提交了时间
            if start:
                # 如果上传了开始日期，就调整格式
                start_data = datetime.strptime(start, '%Y/%m/%d')
            else:
                # 如果没有上传开始日期，就设置为指定的日期
                start_data = datetime(year=2018, month=6, day=1)

            if end:
                end_data = datetime.strptime(end, '%Y/%m/%d')
            else:
                # 如果没有提交结束日期，默认设为今天
                end_data = datetime.today()

            newses = newses.filter(pub_time__range=(make_aware(start_data), make_aware(end_data)))

        if title:
            newses = newses.filter(title__icontains=title)

        if category_id:
            newses = newses.filter(category=category_id)

        # 转化为paginator对象
        paginator = Paginator(newses, 2)
        # 提取page_index页的数据
        page_obj = paginator.page(page_index)
        # 获取分页栏所需的数据
        context_data = self.get_pagination_data(paginator, page_obj)
        context = {
            'categories': NewsCategor.objects.all(),
            'newses': page_obj.object_list,
            # 集成普通的View所以需要手动传递page_obj
            'page_obj': page_obj,
            'paginator': paginator,
            'start': start,
            'end': end,
            'title': title,
            'category_id': category_id,
            'url_query': '&' + parse.urlencode({
                'start': start or '',
                'end': end or '',
                'title': title or '',
                'category': category_id or '',
            })
        }
        print(context['url_query'])
        # 更新字典
        context.update(context_data)
        return render(request, 'cms/news_list.html', context=context)

    def get_pagination_data(self, paginator, page_obj, around_count=2):
        # 当前页号
        current_page = page_obj.number
        # 总页数
        num_pages = paginator.num_pages
        # 是否上一页
        left_has_more = False
        # 是否有下一页
        right_has_more = False

        if current_page <= around_count + 2:
            left_pages = range(1, current_page)
        else:
            left_has_more = True
            left_pages = range(current_page - around_count, current_page)

        if current_page >= num_pages - around_count - 1:
            right_pages = range(current_page + 1, num_pages + 1)
        else:
            right_has_more = True
            right_pages = range(current_page + 1, current_page + around_count + 1)

        return {
            # 左边页码的下标
            'left_pages': left_pages,
            # 右边页码的下标
            'right_pages': right_pages,
            # 当前页码的下标
            'current_page': current_page,
            # 是否还有上一页
            'left_has_more': left_has_more,
            # 是否还有下一页
            'right_has_more': right_has_more,
            'num_pages': num_pages
        }


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


def banner_list(request):
    # 以前后端分离的方式返回当前数据库中的轮播图
    banners = Banner.objects.all()
    serializer = BannerSerializer(banners, many=True)
    data = serializer.data
    return restful.result(data=data)


def delete_banner(request):
    banner_id = request.POST.get("banner_id")
    Banner.objects.filter(pk=banner_id).delete()
    return restful.ok()


def add_banner(request):
    form = AddBannerForm(request.POST)
    if form.is_valid():
        priority = form.cleaned_data.get('priority')
        image_url = form.cleaned_data.get('image_url')
        link_to = form.cleaned_data.get('link_to')
        banner = Banner.objects.create(priority=priority, image_url=image_url, link_to=link_to)
        return restful.result(data={'banner_id': banner.pk})
    else:
        return restful.params_errors(message=form.get_errors())


def edit_banner(request):
    form = EditBannerForm(request.POST)
    if form.is_valid():
        pk = form.cleaned_data.get('pk')
        priority = form.cleaned_data.get('priority')
        image_url = form.cleaned_data.get('image_url')
        link_to = form.cleaned_data.get('link_to')
        Banner.objects.filter(pk=pk).update(image_url=image_url, link_to=link_to, priority=priority)
        return restful.ok()
    else:
        return restful.params_errors(message=form.get_errors())


class PubCourse(View):
    def get(self, request):
        context = {
            'categories': CourseCategory.objects.all(),
            'teachers': Teacher.objects.all()
        }
        return render(request, 'cms/pub_course.html', context=context)

    def post(self, request):
        form = PubCourseForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            category_id = form.cleaned_data.get('category_id')
            video_url = form.cleaned_data.get('video_url')
            cover_url = form.cleaned_data.get("cover_url")
            price = form.cleaned_data.get('price')
            duration = form.cleaned_data.get('duration')
            profile = form.cleaned_data.get('profile')
            teacher_id = form.cleaned_data.get('teacher_id')

            category = CourseCategory.objects.get(pk=category_id)
            teacher = Teacher.objects.get(pk=teacher_id)

            Course.objects.create(title=title, video_url=video_url, cover_url=cover_url,
                                  price=price, duration=duration,
                                  profile=profile, category=category, teacher=teacher)
            return restful.ok()
        else:
            return restful.params_errors(message=form.get_errors())


@xfz_superuser_required
def staff_index(request):
    staffs = User.objects.filter(is_staff=True)
    context = {
        'staffs': staffs
    }
    return render(request, 'cms/staffs.html', context=context)


@method_decorator(xfz_superuser_required, name='dispatch')
class AddStaffView(View):
    def get(self, request):
        groups = Group.objects.all()
        context = {
            'groups': groups
        }
        return render(request, 'cms/add_staff.html', context=context)

    def post(self, request):
        telephone = request.POST.get('telephone')
        user = User.objects.filter(telephone=telephone).first()
        user.is_staff = True
        # 所有的checkbox的name都是groups，所以需要使用getlist获取全部
        group_ids = request.POST.getlist("groups")
        groups = Group.objects.filter(pk__in=group_ids)
        # `user.groups`：某个用户上的所有分组。多对多的关系。
        user.groups.set(groups)
        user.save()
        return redirect(reverse('cms:staffs'))
