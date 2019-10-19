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
    this.bannerGroup = $("#banner-group");
    this.index = 0;
    this.leftArrow = $(".left-arrow");
    this.rightArrow = $(".right-arrow");
    this.bannerUl = $("#banner-ul");
    this.liList = this.bannerUl.children("li");
    this.bannerCount = this.liList.length;
    this.listenBannerHover();
}

Banner.prototype.toggleArrow = function (isShow) {
    var self = this;
    if (isShow) {
        self.leftArrow.show();
        self.rightArrow.show();
    } else {
        self.leftArrow.hide();
        self.rightArrow.hide();
    }

};

Banner.prototype.listenBannerHover = function () {
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

Banner.prototype.animate = function () {
    var self = this;
    this.bannerUl.animate({'left': -798 * self.index}, 500);
};


Banner.prototype.loop = function () {
    var self = this;
    //定时轮播效果，时间间隔2000ms
    this.timer = setInterval(function () {
        self.index++;
        if (self.index > self.bannerCount - 1) self.index = 0;
        //每次轮播的移动时间为500ms
        self.animate();
    }, 2000);
};

Banner.prototype.listenBannerClick = function () {
    var self = this;
    self.leftArrow.click(function () {
        self.index--;
        if (self.index < 0) self.index = self.bannerCount - 1;
        self.animate();
    });
    self.rightArrow.click(function () {
        self.index++;
        if (self.index > self.bannerCount - 1) self.index = 0;
        self.animate();
    });
};

Banner.prototype.run = function () {
    this.loop();
    this.listenBannerClick();
};

$(function () {
    var banner = new Banner();
    banner.run();
});