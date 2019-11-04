function Banners() {

}

Banners.prototype.createBannnerItem = function (banner) {
    var self = this;
    var tpl = template("banner-item", {"banner": banner});
    var bannerListGroup = $(".banner-list-group");
    var bannerItem = null;
    if (banner) {
        bannerListGroup.append(tpl);
        bannerItem = bannerListGroup.find(".banner-item:last");
    } else {
        bannerListGroup.prepend(tpl);
        bannerItem = bannerListGroup.find(".banner-item:first");
    }
    self.addImageSelectEvent(bannerItem);
    self.listenRemoveBannerEvent(bannerItem);
    self.listenSaveBannerEvent(bannerItem);
};

Banners.prototype.listenAddBannerEvent = function () {
    var self = this;
    var addBtn = $("#add-banner-btn");
    addBtn.click(function () {
        // var tpl = template("banner-item");
        // var bannerListGroup = $(".banner-list-group");
        // bannerListGroup.prepend(tpl);
        //
        // //使用arttemplate必须添加完成后才能绑定点击事件等操作
        // //通过轮播图组找到新添加的轮播图
        // var bannerItem = bannerListGroup.find(".banner-item:first");
        // self.addImageSelectEvent(bannerItem);
        // self.listenRemoveBannerEvent(bannerItem);
        // self.listenSaveBannerEvent(bannerItem);
        self.createBannnerItem();
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

Banners.prototype.listenRemoveBannerEvent = function (bannerItem) {
    var closeBtn = bannerItem.find('#close-btn');
    closeBtn.click(function () {
        bannerItem.remove();
    });
};

Banners.prototype.listenSaveBannerEvent = function (bannerItem) {
    var saveBtn = bannerItem.find("#save-btn");
    var imageTag = bannerItem.find(".thumbnail");
    var priorityTag = bannerItem.find("input[name='priority']");
    var linkToTag = bannerItem.find("input[name='link_to']");
    var prioritySpan = bannerItem.find('span[class="priority"]');
    saveBtn.click(function () {
        var image_url = imageTag.attr('src');
        var priority = priorityTag.val();
        var link_to = linkToTag.val();
        xfzajax.post({
            'url': '/cms/add_banner/',
            'data': {
                'image_url': image_url,
                'priority': priority,
                'link_to': link_to,
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    var bannerId = result['data']['banner_id'];
                    prioritySpan.text("优先级：" + priority);
                    window.messageBox.showSuccess("轮播图添加成功");
                }
            }
        });
    });
};


Banners.prototype.loadData = function () {
    var self = this;
    xfzajax.get({
        'url': '/cms/banner_list/',
        'success': function (result) {
            if (result['code'] === 200) {
                var banners = result['data'];
                for (var i = 0; i < banners.length; i++) {
                    var banner = banners[i];
                    self.createBannnerItem(banner);
                }
            }
        }
    })
};

Banners.prototype.run = function () {
    var self = this;
    self.listenAddBannerEvent();
    self.loadData();
};

$(function () {
    var banners = new Banners();
    banners.run();
});