function NewsList() {

}

NewsList.prototype.listenSubmitEvent = function () {
    var submitBtn = $(".submit-btn");
    var textarea = $("textarea[name='comment']");
    submitBtn.click(function () {
        var content = textarea.val();
        var news_id = submitBtn.attr('data-news-id');
        xfzajax.post({
            'url': '/news/public_comment/',
            'data': {
                'content': content,
                'news_id': news_id
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    var comment = result['data'];
                    // 传给前端的comment-item,传递的变量名为comment
                    var html = template("comment-item", {"comment": comment});
                    var ul = $(".comment-list");
                    ul.prepend(html);
                    window.messageBox.showSuccess('评论发表成功');
                    textarea.val("");
                }
            }
        });
    });
};

NewsList.prototype.run = function () {
    var self = this;
    self.listenSubmitEvent();
};

$(function () {
    var newsList = new NewsList();
    newsList.run();
});