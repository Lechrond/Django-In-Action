//========================用来处理导航条的=========================
function FrontBase() {

}

FrontBase.prototype.run = function () {
    var self = this;
    self.listenAuthBox();
    self.handleNavStatus();
};

FrontBase.prototype.handleNavStatus = function () {
    // http://127.0.0.1:8000/payinfo/
    var url = window.location.href;
    var protocol = window.location.protocol;
    var host = window.location.host;
    var domain = protocol + '//' + host;
    var path = url.replace(domain, '');
    // console.log('path:' + path);
    var navList = $(".nav li");
    navList.each(function (index, element) {
        var li = $(element);
        var aTag = li.children("a");
        var href = aTag.attr('href');
        if (href === path) {
            li.addClass("active");
            return false;
        }
    })
};

FrontBase.prototype.listenAuthBox = function () {
    // 登陆后鼠标悬浮后显示浮动窗口
    var authBox = $(".auth-box");
    var userMoreBox = $(".user-more-box");
    authBox.hover(function () {
        userMoreBox.show();
    }, function () {
        userMoreBox.hide();
    });
};

//=====================用来处理登陆和注册的=========================
function Auth() {
    var self = this;
    self.maskWrapper = $('.mask-wrapper');
    self.scrollWrapper = $(".scroll-wrapper");
    self.smsCaptcha = $(".sms-captcha-btn");
}

Auth.prototype.run = function () {
    var self = this;
    self.listenShowHideEvent();
    self.listenSwitchEvent();
    self.listenSigninEvent();
    self.listenSignupEvent();
    self.listenImgCaptchaEvent();
    self.listenSmsCaptchEvent();
};

Auth.prototype.showEvent = function () {
    var self = this;
    self.maskWrapper.show();
};

Auth.prototype.hideEvent = function () {
    var self = this;
    self.maskWrapper.hide();
};

Auth.prototype.smsSuccessEvent = function () {
    // 短信成功发送后执行的代码
    var self = this;
    messageBox.showSuccess('短信验证码发送成功！');
    self.smsCaptcha.addClass('disable');
    var count = 60;
    // 倒计时内无法再次点击
    self.smsCaptcha.unbind('click');
    var timmer = setInterval(function () {
        self.smsCaptcha.text(count + 's');
        count--;
        if (count <= 0) {
            clearInterval(timmer);
            self.smsCaptcha.removeClass('disable');
            self.smsCaptcha.text('发送验证码');
            // 倒计时结束后重新执行点击监听
            self.listenSmsCaptchEvent();
        }
    }, 1000);
};

Auth.prototype.listenShowHideEvent = function () {
    // 模态对话框的弹出和关闭
    var self = this;
    var signinBtn = $('.signin-btn');
    var signupBtn = $('.signup-btn');
    var closeBtn = $('.close-btn');
    signinBtn.click(function () {
        self.showEvent();
        self.scrollWrapper.css({'left': 0});
    });
    signupBtn.click(function () {
        self.showEvent();
        self.scrollWrapper.css({'left': -400});
    });
    closeBtn.click(function () {
        self.hideEvent();
    })
};

Auth.prototype.listenSwitchEvent = function () {
    // 模态对话框登陆和注册页面的切换
    var self = this;
    var switcher = $(".switch");
    switcher.click(function () {
        var currentLeft = self.scrollWrapper.css("left");
        currentLeft = parseInt(currentLeft);
        if (currentLeft < 0) {
            self.scrollWrapper.animate({"left": 0});
        } else {
            self.scrollWrapper.animate({"left": "-400px"});
        }
    });
};

Auth.prototype.listenSigninEvent = function () {
    var self = this;
    var signinGroup = $('.signin-group');
    var telephoneInput = signinGroup.find('input[name="telephone"]');
    var passwordInput = signinGroup.find('input[name="password"]');
    var rememberInput = signinGroup.find('input[name="remember"]');

    var submitBtn = signinGroup.find('.submit-btn');
    submitBtn.click(function () {
        var telephone = telephoneInput.val();
        var password = passwordInput.val();
        var remember = rememberInput.prop('checked');

        xfzajax.post({
            'url': '/account/login/',
            'data': {
                'telephone': telephone,
                'password': password,
                'remember': remember ? 1 : 0
            },
            'success': function (result) {
                if (result['code'] == 200) {
                    window.location.reload();
                }
            },
        })
    })
};

Auth.prototype.listenSignupEvent = function () {
    var self = this;
    var signupGroup = $('.signup-group');
    var submitBtn = signupGroup.find('.submit-btn');
    submitBtn.click(function (event) {
        event.preventDefault();
        var telephoneInput = signupGroup.find("input[name='telephone']");
        var usernameInput = signupGroup.find("input[name='username']");
        var imgCaptchaInput = signupGroup.find("input[name='img_captcha']");
        var password1Input = signupGroup.find("input[name='password1']");
        var password2Input = signupGroup.find("input[name='password2']");
        var smsCaptchaInput = signupGroup.find("input[name='sms_captcha']");

        var telephone = telephoneInput.val();
        var username = usernameInput.val();
        var img_captcha = imgCaptchaInput.val();
        var password1 = password1Input.val();
        var password2 = password2Input.val();
        var sms_captcha = smsCaptchaInput.val();

        xfzajax.post({
            'url': '/account/register/',
            'data': {
                'telephone': telephone,
                'username': username,
                'img_captcha': img_captcha,
                'password1': password1,
                'password2': password2,
                'sms_captcha': sms_captcha,
            },
            'success': function (result) {
                if (result['code'] == 200) {
                    window.location.reload();
                }
            },
        })
    })
};

Auth.prototype.listenImgCaptchaEvent = function () {
    // 点击图形验证码可以刷新
    var imgCaptcha = $('.img_captcha');
    imgCaptcha.click(function () {
        imgCaptcha.attr('src', '/account/img_captcha/' + "?random=" + Math.random())
    });
};

Auth.prototype.listenSmsCaptchEvent = function () {
    // 发送短信验证码
    var self = this;
    var telephoneInput = $(".signup-group input[name='telephone']");
    self.smsCaptcha.click(function () {
        var telephone = telephoneInput.val();
        if (!telephone) {
            messageBox.showInfo("请输入手机号码");
        }
        xfzajax.get({
            'url': '/account/sms_captcha/',
            'data': {
                'telephone': telephone
            },
            'success': function (result) {
                if (result['code'] == 200) {
                    self.smsSuccessEvent();
                }
            },
            'fail': function (error) {
                console.log(error);
            }
        });
    })

};

$(function () {
    var auth = new Auth();
    auth.run();
});

$(function () {
    var frontBase = new FrontBase();
    frontBase.run();
});

$(function () {
    if (template) {
        template.defaults.imports.timeSince = function (dateValue) {
            var date = new Date(dateValue);
            var datets = date.getTime(); // 得到的是毫秒的
            var nowts = (new Date()).getTime(); //得到的是当前时间的时间戳
            var timestamp = (nowts - datets) / 1000; // 除以1000，得到的是秒
            if (timestamp < 60) {
                return '刚刚';
            } else if (timestamp >= 60 && timestamp < 60 * 60) {
                minutes = parseInt(timestamp / 60);
                return minutes + '分钟前';
            } else if (timestamp >= 60 * 60 && timestamp < 60 * 60 * 24) {
                hours = parseInt(timestamp / 60 / 60);
                return hours + '小时前';
            } else if (timestamp >= 60 * 60 * 24 && timestamp < 60 * 60 * 24 * 30) {
                days = parseInt(timestamp / 60 / 60 / 24);
                return days + '天前';
            } else {
                var year = date.getFullYear();
                var month = date.getMonth();
                var day = date.getDay();
                var hour = date.getHours();
                var minute = date.getMinutes();
                return year + '/' + month + '/' + day + " " + hour + ":" + minute;
            }
        }
    }
});