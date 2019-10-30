function News() {

}

News.prototype.listenUploadFileEvent = function () {
    var uploadBtn = $('#thumbnail-btn');
    uploadBtn.change(function () {
        var file = uploadBtn[0].files[0];
        var formData = new FormData();
        formData.append('file', file);
        xfzajax.post({
            'url': '/cms/upload_file/',
            'data': formData,
            // jq不处理文件
            'processData': false,
            'contentType': false,
            'success': function (result) {
                if (result['code'] == 200) {
                    var url = result['data']['url'];
                    var thumbnailInput = $('#thumbnail-form');
                    thumbnailInput.val(url);
                }
            }
        })
    });
};

News.prototype.run = function () {
    var self = this;
    self.listenUploadFileEvent();
};

$(function () {
    var news = new News();
    news.run();
});