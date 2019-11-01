// function Banner() {
//     //相当于python中的__init__方法
//     console.log("构造函数");
//     //通过this关键字绑定属性
//     this.person = 'lechrond';
// }
// //绑定一个方法
// Banner.prototype.greet = function (word) {
//     console.log("hello world, ",word);
// }
//
// var banner = new Banner();
// console.log(banner.person);
// banner.greet('lechrond');

function Banner() {
    //单个轮播图的宽度
    this.bannerWidth = 798;
    //播放轮播图的盒子
    this.bannerGroup = $("#banner-group");
    //当前轮到的图片
    this.index = 1;
    //左箭头
    this.leftArrow = $(".left-arrow");
    //右箭头
    this.rightArrow = $(".right-arrow");
    //轮播图列表
    this.bannerUl = $("#banner-ul");
    //轮播图的集合
    this.liList = this.bannerUl.children("li");
    //轮播图的数量
    this.bannerCount = this.liList.length;
    //获取小白点
    this.pageControl = $(".page-control");
}

Banner.prototype.initBanner = function () {
    var self = this;

    var firstBanner = self.liList.eq(0).clone();
    var lastBanner = self.liList.eq(self.bannerCount - 1).clone();
    self.bannerUl.append(firstBanner);
    self.bannerUl.prepend(lastBanner);

    //动态设置轮播图的总宽度
    this.bannerUl.css({
        "width": self.bannerWidth * (self.bannerCount + 2),
        'left': -self.bannerWidth
    })
};

Banner.prototype.initPageControl = function () {
    var self = this;
    for (var i = 0; i < self.bannerCount; i++) {
        //创建li标签
        var circle = $("<li></li>");
        self.pageControl.append(circle);
        //默认激活第一个
        if (i === 0) {
            circle.addClass('active');
        }
    }
    //设置ul的宽度
    self.pageControl.css({'width': self.bannerCount * 15 + (self.bannerCount - 1) * 16 + 2 * 8});
};

Banner.prototype.toggleArrow = function (isShow) {
    //实现鼠标悬停显示箭头，离开消失
    var self = this;
    if (isShow) {
        self.leftArrow.show();
        self.rightArrow.show();
    } else {
        self.leftArrow.hide();
        self.rightArrow.hide();
    }

};


Banner.prototype.animate = function () {
    //实现图片轮播到指定的index
    var self = this;
    //每次轮播的移动时间为500ms
    this.bannerUl.animate({'left': -798 * self.index}, 500);
    var index = self.index;
    if (index === 0) {
        index = self.bannerCount - 1;
    } else if (index === self.bannerCount + 1) {
        index = 0;
    } else {
        index = self.index - 1;
    }
    self.pageControl.children('li').eq(index).addClass('active').siblings().removeClass('active');
};


Banner.prototype.loop = function () {
    //实现自动循环轮播
    var self = this;
    //定时器，时间间隔5000ms
    this.timer = setInterval(function () {
        if (self.index >= self.bannerCount + 1) {
            //遇到最后拼接的图片就跳转到原始的第一张图片，不采用动画效果
            self.bannerUl.css({'left': -self.bannerWidth});
            self.index = 2;
        } else {
            self.index++;
        }
        self.animate();
    }, 5000);
};

Banner.prototype.listenBannerHover = function () {
    //监听鼠标的悬停
    var self = this;
    this.bannerGroup.hover(function () {
            //把鼠标移上去的时候执行
            clearInterval(self.timer);
            self.toggleArrow(true);
        },
        function () {
            //把鼠标移走的时候执行
            self.loop();
            self.toggleArrow(false);
        })
};

Banner.prototype.listenBannerClick = function () {
    //实现点击箭头切换轮播图
    var self = this;
    self.leftArrow.click(function () {
        //左箭头逻辑
        if (self.index === 0) {
            self.bannerUl.css({'left': -self.bannerCount * self.bannerWidth});
            self.index = self.bannerCount - 1;
        } else {
            self.index--;
        }
        self.animate();
    });
    self.rightArrow.click(function () {
        //右箭头逻辑
        if (self.index === self.bannerCount + 1) {
            self.bannerUl.css({'left': -self.bannerWidth});
            self.index = 2;
        } else {
            self.index++;
        }
        self.animate();
    });
};

Banner.prototype.listenPageControl = function () {
    //监听小白点的事件
    var self = this;
    self.pageControl.children('li').each(function (index, obj) {
        $(obj).click(function () {
            self.index = index + 1;
            self.animate();
        })
    })
};

Banner.prototype.run = function () {
    //初始化轮播图
    this.initBanner();
    //初始化小白点
    this.initPageControl();
    //启动自动轮播
    this.loop();
    //启动监听鼠标点击
    this.listenBannerClick();
    //启动监听鼠标悬停
    this.listenBannerHover();
    //启动监听小白点
    this.listenPageControl();
};

function Index() {
    var self = this;
    self.page = 2;

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

Index.prototype.listenLoadMoreEvent = function () {
    var self = this;
    var loadBtn = $("#load-more-btn");
    loadBtn.click(function () {
        xfzajax.get({
            'url': '/news/list/',
            'data': {
                'p': self.page
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    var newses = result['data'];
                    if (newses.length > 0) {
                        var html = template("news-item", {"newses": newses});
                        var ul = $(".list-inner-group");
                        ul.append(html);
                        self.page++;
                    } else {
                        loadBtn.hide();
                    }
                }
            }
        })
    });
};


Index.prototype.run = function () {
    var self = this;
    self.listenLoadMoreEvent();
};

$(function () {
    var banner = new Banner();
    banner.run();

    var index = new Index();
    index.run();
});