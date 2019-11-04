function Banners() {

}

Banners.prototype.listenAddBannerEvent = function () {
    var self = this;
    var addBtn = $("#add-banner-btn");
    addBtn.click(function () {
        var tpl = template("banner-item");
        var bannerListGroup = $(".banner-list-group");
        bannerListGroup.prepend(tpl);

        //使用arttemplate必须添加完成后才能绑定点击事件等操作
        //通过轮播图组找到新添加的轮播图
        var bannerItem = bannerListGroup.find(".banner-item:first");
        self.addImageSelectEvent(bannerItem);
    });
};

Banners.prototype.addImageSelectEvent = function (bannerItem) {
    var image = bannerItem.find('.thumbnail');
    //图片是不能打开文件选择窗口的，只能通过input标签
    var imageInput = bannerItem.find('.image-input');
    image.click(function () {
        //通过点击图片，实现input标签的点击
        imageInput.click();
    });

    imageInput.change(function () {
        var file = this.files[0];
        var formData = new FormData();
        //后端通过request.FILES.get('file')获取文件
        formData.append("file", file);
        xfzajax.post({
            'url': '/cms/upload_file/',
            'data': formData,
            'processData': false,
            'contentType': false,
            'success': function (result) {
                if (result['code'] === 200) {
                    var url = result['data']['url'];
                    image.attr('src', url);
                }
            }
        });
    });
};

Banners.prototype.run = function () {
    var self = this;
    self.listenAddBannerEvent();
};

$(function () {
    var banners = new Banners();
    banners.run();
});