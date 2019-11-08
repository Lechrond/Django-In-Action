function CMSNewsList() {

}

CMSNewsList.prototype.initDatePicker = function () {
    var self = this;
    var startPicker = $("#start-picker");
    var endPicker = $("#end-picker");
    var todayDate = new Date();
    var todayStr = todayDate.getFullYear() + '/' + (todayDate.getMonth() + 1) + '/' + todayDate.getDate();
    var options = {
        'showButtonPanel': true,
        'format': 'yyyy/mm/dd',
        'startDate': '2017/6/1',
        'endDate': todayStr,
        'language': 'zh-CN',
        'todayBtn': 'linked',
        'todayHighlight': true,
        'clearBtn': true,
        'autoclose': true
    };
    startPicker.datepicker(options);
    endPicker.datepicker(options);
};

CMSNewsList.prototype.run = function () {
    var self = this;
    self.initDatePicker();
};

$(function () {
    var cmsNewsList = new CMSNewsList();
    cmsNewsList.run();
});