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
    // self.addImageSelectEvent(bannerItem);
    self.listenRemoveBannerEvent(bannerItem);
    self.listenSaveBannerEvent(bannerItem);
    self.listenQiniuUploadFileEvent(bannerItem);
};

Banners.prototype.listenAddBannerEvent = function () {
    var self = this;
    var bannerListGroup = $(".banner-list-group");
    var addBtn = $("#add-banner-btn");
    addBtn.click(function () {
        var length = bannerListGroup.children().length;
        if (length >= 6) {
            window.messageBox.showInfo("最多只能添加六张轮播图");
            return;
        }
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

Banners.prototype.listenQiniuUploadFileEvent = function (bannerItem) {
    var self = this;
    var image = bannerItem.find('.thumbnail');
    //图片是不能打开文件选择窗口的，只能通过input标签
    var imageInput = bannerItem.find('.image-input');
    image.click(function () {
        //通过点击图片，实现input标签的点击
        imageInput.click();
    });
    imageInput.change(function () {
        var file = this.files[0];
        xfzajax.get({
            'url': '/cms/qntoken/',
            'success': function (result) {
                if (result['code'] === 200) {
                    var token = result['data']['token'];
                    var key = (new Date()).getTime() + '.' + file.name.split('.')[1];
                    var putExtra = {
                        fname: key,
                        params: {},
                        mimeType: ['image/png', 'image/gif', 'image/jpeg']
                    };
                    var config = {
                        useCdnDomain: true,
                        retryCount: 6,
                        region: qiniu.region.z2
                    };
                    var observable = qiniu.upload(file, key, token, putExtra, config);
                    observable.subscribe({
                        "next": self.handleFileUploadProgress,
                        "error": self.handleFileUploadError,
                        // "complete": self.handleFileUploadComplete
                        "complete": function (response) {
                            console.log(response);
                            var domain = 'http://q071w4n4d.bkt.clouddn.com/';
                            var filename = response.key;
                            var url = domain + filename;
                            console.log(url);
                            image.attr('src', url);
                        }
                    });
                }
            }
        })
    });
};

Banners.prototype.handleFileUploadProgress = function (response) {

};

Banners.prototype.handleFileUploadError = function (error) {
    window.messageBox.showError(error.message);
};

Banners.prototype.handleFileUploadComplete = function (response) {
    // image获取不到，暂时不知道怎么解决
    var self = this;
    console.log(response);
    var domain = 'http://q071w4n4d.bkt.clouddn.com/';
    var filename = response.key;
    var url = domain + filename;
    console.log(url);
    self.url = url;
};

Banners.prototype.listenRemoveBannerEvent = function (bannerItem) {
    var closeBtn = bannerItem.find('#close-btn');
    closeBtn.click(function () {
        var bannerId = bannerItem.attr('data-banner-id');
        if (bannerId) {
            xfzalert.alertConfirm({
                'text': '您确定要删除这个轮播图吗？',
                'confirmCallback': function () {
                    xfzajax.post({
                        'url': '/cms/delete_banner/',
                        'data': {
                            'banner_id': bannerId
                        },
                        'success': function (result) {
                            if (result['code'] === 200) {
                                bannerItem.remove();
                                window.messageBox.showSuccess("删除成功");
                            }
                        }
                    })
                }
            })
        } else {
            bannerItem.remove();
        }
    });
};

Banners.prototype.listenSaveBannerEvent = function (bannerItem) {
    var saveBtn = bannerItem.find("#save-btn");
    var imageTag = bannerItem.find(".thumbnail");
    var priorityTag = bannerItem.find("input[name='priority']");
    var linkToTag = bannerItem.find("input[name='link_to']");
    var prioritySpan = bannerItem.find('span[class="priority"]');
    var bannerId = bannerItem.attr("data-banner-id");
    var url = "";
    // 判断当前的保存按钮是更新还是新增轮播图，然后调用相应的url
    if (bannerId) {
        url = '/cms/edit_banner/';
    } else {
        url = "/cms/add_banner/";
    }
    saveBtn.click(function () {
        var image_url = imageTag.attr('src');
        var priority = priorityTag.val();
        var link_to = linkToTag.val();
        xfzajax.post({
            'url': url,
            'data': {
                'image_url': image_url,
                'priority': priority,
                'link_to': link_to,
                // 虽然Add的Form中没有对pk进行处理，但是在view中没有提前这个数据所以没有关系
                'pk': bannerId
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    if (bannerId) {
                        window.messageBox.showSuccess("轮播图修改成功");
                    } else {
                        bannerId = result['data']['banner_id'];
                        bannerItem.attr('data-banner-id', bannerId);
                        window.messageBox.showSuccess("轮播图添加成功");
                    }
                    prioritySpan.text("优先级：" + priority);
                    window.location.reload();
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