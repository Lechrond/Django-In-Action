from django.shortcuts import render
from .models import Payinfo


# Create your views here.
def index(request):
    context = {
        'payinfos': Payinfo.objects.all()
    }
    return render(request, 'payinfo/payinfo.html',context=context)
