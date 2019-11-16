from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission, ContentType
from apps.news.models import News, NewsCategor, Banner, Comment
from apps.course.models import Course, CourseCategory, Teacher, CourseOrder
from apps.payinfo.models import Payinfo


# 命名格式必须为Command继承自BaseCommand类
class Command(BaseCommand):
    # 处理命令的逻辑代码
    def handle(self, *args, **options):
        # 1.编辑组（管理文章/管理课程/管理评论/管理轮播图）
        edit_content_types = [
            ContentType.objects.get_for_model(News),
            ContentType.objects.get_for_model(NewsCategor),
            ContentType.objects.get_for_model(Banner),
            ContentType.objects.get_for_model(Comment),
            ContentType.objects.get_for_model(Course),
            ContentType.objects.get_for_model(CourseCategory),
            ContentType.objects.get_for_model(Teacher),
            ContentType.objects.get_for_model(Payinfo),
        ]
        edit_permissions = Permission.objects.filter(content_type__in=edit_content_types)
        if not Group.objects.filter(name='编辑').exists():
            edit_group = Group.objects.create(name='编辑')
            edit_group.permissions.set(edit_permissions)
            edit_group.save()
            self.stdout.write(self.style.SUCCESS('编辑组创建完成！'))
        # 2.财务组（课程订单/付费资讯订单）
        finance_content_types = [
            ContentType.objects.get_for_model(CourseOrder)
        ]
        finance_permissions = Permission.objects.filter(content_type__in=finance_content_types)
        if not Group.objects.filter(name='财务').exists():
            finance_group = Group.objects.create(name='财务')
            finance_group.permissions.set(finance_permissions)
            finance_group.save()
        self.stdout.write(self.style.SUCCESS('财务组创建完成！'))
        # 3.管理员组（全部权限）
        admin_permissions = edit_permissions.union(finance_permissions)
        if not Group.objects.filter(name='管理员').exists():
            admin_group = Group.objects.create(name='管理员')
            admin_group.permissions.set(admin_permissions)
            admin_group.save()
            self.stdout.write(self.style.SUCCESS('管理员组创建完成！'))
        # 4.超级管理员
