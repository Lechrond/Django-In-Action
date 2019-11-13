from django.shortcuts import render, reverse
from .models import Course, CourseOrder


# Create your views here.
def course_index(request):
    context = {
        'courses': Course.objects.all()
    }
    return render(request, 'course/course_index.html', context=context)


def course_detail(request, course_id):
    course = Course.objects.get(pk=course_id)
    context = {
        'course': course
    }
    return render(request, 'course/course_detail.html', context=context)


def course_order(request, course_id):
    course = Course.objects.get(pk=course_id)
    # order = CourseOrder.objects.create(course=course, buyer=request.user, status=1,
    #                                    amount=course.price)
    context = {
        'goods': {
            'thumbnail': course.cover_url,
            'title': course.title,
            'price': course.price
        },
        # 'order': order,
        # # /course/notify_url/
        # 'notify_url': request.build_absolute_uri(reverse('course:notify_view')),
        # 'return_url': request.build_absolute_uri(
        #     reverse('course:course_detail', kwargs={"course_id": course.pk}))
    }
    return render(request, 'course/course_order.html', context=context)
