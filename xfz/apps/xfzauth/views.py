from django.contrib.auth import login, logout, authenticate, get_user_model
from django.views.decorators.http import require_POST
from .forms import LoginForm, RegisterForm
from django.http import JsonResponse, HttpResponse
from django.shortcuts import reverse, redirect
from utils import restful, smssender
from utils.captcha.xfzcaptcha import Captcha
from io import BytesIO
from django.core.cache import cache

User = get_user_model()


@require_POST
def login_view(request):
    form = LoginForm(request.POST)
    if form.is_valid():
        telephone = form.cleaned_data.get('telephone')
        password = form.cleaned_data.get('password')
        remember = form.cleaned_data.get('remember')
        user = authenticate(request, username=telephone, password=password)
        if user:
            if user.is_active:
                login(request, user)
                if remember:
                    request.session.set_expiry(None)
                else:
                    request.session.set_expiry(0)
                return restful.ok()
            else:
                return restful.unauth('您的账号已经被冻结')
        else:
            return restful.params_errors("手机号或密码错误")
    else:
        errors = form.get_errors()
        return restful.params_errors(errors)


@require_POST
def register(request):
    form = RegisterForm(request.POST)
    if form.is_valid():
        telephone = form.cleaned_data.get('telephone')
        username = form.cleaned_data.get('username')
        password = form.cleaned_data.get('password1')
        user = User.objects.create_user(telephone=telephone, username=username, password=password)
        login(request, user)
        return restful.ok()
    else:
        print('表单验证失败：', form.get_errors())
        return restful.params_errors(message=form.get_errors())


def logout_view(request):
    logout(request)
    return redirect(reverse('index'))


def img_captcha(request):
    text, image = Captcha.gene_code()
    # ByteIO相当于一个管道，用来存储图片的流数据
    out = BytesIO()
    # 调用image的save方法，将这个image对象保存到ByteIO中
    image.save(out, 'png')
    # 将ByteIO文件指针移动到最开始的地方
    out.seek(0)
    response = HttpResponse(content_type='image/png')
    # 从ByteIO的管道中读取出图片数据，保存到response对象上
    response.write(out.read())
    response['Content-length'] = out.tell()
    cache.set(text.lower(), text.lower(), 5 * 60)
    print(cache.get(text.lower()))
    print('图形验证码:', text)
    return response


def sms_captcha(request):
    telephone = request.GET.get('telephone')
    code = Captcha.gene_text()
    cache.set(telephone, code, 5 * 60)
    print('短信验证码:', code)
    return restful.ok()
    # result = smssender.sms_captcha_sender(telephone, code)
    # if result:
    #     return restful.ok()
    # else:
    #     return restful.params_errors(message='短信验证码发送失败')


def cache_test(request):
    cache.set('username', 'lechrond', 60)
    result = cache.get('username')
    print(result)
    return HttpResponse("success")
