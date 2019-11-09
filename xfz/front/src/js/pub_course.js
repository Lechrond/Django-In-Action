function PubCourse() {

}

PubCourse.prototype.initUEditor = function () {
    window.ue = UE.getEditor('editor', {
        'initialFrameHeight': 400,
        'initialFrameWidth': 1240,
        'serverUrl': '/ueditor/upload/'
    });
};

PubCourse.prototype.run = function () {
    var self = this;
    self.initUEditor();
};

$(function () {
    var course = new PubCourse();
    course.run();
});