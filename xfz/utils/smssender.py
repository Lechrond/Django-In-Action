import requests


def sms_captcha_sender(mobile, captcha):
    url = "http://v.juhe.cn/sms/send"
    params = {
        'mobile': mobile,
        'tpl_id': '194904',
        'tpl_value': '#code#=%s' % captcha,
        'key': '2a26d830cdb1eb32e3e58f393c7f5b0a',
    }
    response = requests.get(url, params=params)
    result = response.json()
    print(result)
    if result['error_code'] == 0:
        return True
    else:
        return False


if __name__ == '__main__':
    mobile = input()
    captcha = input()
    sms_captcha_sender(mobile, captcha)
