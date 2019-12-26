var status = 'true';
var proj_id = 0;
$(function () {
    var id = getQueryString('proj_id');
    if (id != '' && id != null) {
        proj_id = id;
    }
    $("#proj_id").val(proj_id);
    ajax_com({"c": 'project/proj_git-branch_list', 'proj_id': proj_id}, function (data) {
        if (data.errno === 0) {
            var data = data.data;
            var ht = '';
            $(data).each(function (i, v) {
                var s = '';
                if (v.active) {
                    s = 'selected="selected"';
                    $("#branch_id").val(v.branch_id);
                }
                ht += '<option value="' + v.branch_id + '" ' + s + '>' + v.branch_name + '</option>';
            })
            $('#branch_list').html(ht)
            table = show_list();
        } else {
            layer.msg(data.message, {icon: 2});
            setTimeout(function () {
                parent.location.reload();
            }, 1000)
        }
    })
})

function show_list() {
    return $("#editable").dataTable({
        "serverSide": true,  //启用服务器端分页
        "pageLength": 10,
        "lengthChange": false,
        "searching": false,
        "orderMulti": false,  //启用多列排序
        "bSort": false,
        "oLanguage": {
            sInfo: "总共有 _MAX_ 条数据",
            sInfoFiltered: "总共有 _MAX_ 条数据",
            sInfoEmpty: "暂无数据",
        },
        "ajax": function (data, callback, settings) {
            //封装请求参数
            var page = (data.start / data.length) + 1;//当前页码
            $("input[name='page']").val(page);
            var proj_id = getQueryString('proj_id');
            $('.proj_id').val(proj_id);
            ajax_com($("#form-member-add").serialize(), function (data) {
                if (data.errno === 0) {
                    var data = data.data;
                    var returnData = {};
                    returnData.draw = data.draw;//这里直接自行返回了draw计数器,应该由后台返回
                    returnData.recordsTotal = data.cnt_data;//返回数据全部记录
                    returnData.recordsFiltered = data.cnt_data;//返回数据全部记录
                    returnData.data = data.list;//返回的数据列表
                    callback(returnData);
                    $(".dataTables_paginate").append("<div style='float:right;margin: 0 10px'><input type='number' style='width: 30px;height: 22px;'><input type='button' value='确定' id='direct_page' style='background: #ffffff;line-height: 28px;border:1px solid #ccc;height: 26px;padding: 0 6px;margin-left: 5px;cursor: pointer;'></div>");
                    $("#direct_page").click(function () {
                        var jump_page = $(this).parent().find("input").val();
                        if (jump_page) $("#editable").dataTable().fnPageChange(jump_page - 1);
                    })
                } else layer.msg(data.msg, {icon: 2});
            })
        },
        "columns": [
            {data: 'id'},
            {data: 'time'},
            {data: 'branch_name'},
            {data: 'remaking'},
            {data: 'option'},
        ]
    }).api();
}

function update() {
    var branch_id = $("#branch_list").val();
    var time = $("#time").val();
    var remaking = $("#remaking").val();
    ajax_com({
        "c": 'project/proj_git-update_timing_add',
        'proj_id': proj_id,
        'branch_id': branch_id,
        'time': time,
        'remaking': remaking,
    }, function (data) {
        if (data.errno === 0) {
            layer.msg('ok', {icon: 1});
            setTimeout(function () {
                self.location.reload();
            }, 1000)
        } else {
            layer.msg(data.message, {icon: 2});
        }
    })
}

function del($id) {
    ajax_com({
        "c": 'project/proj_git-update_timing_del',
        'id': $id,
    }, function (data) {
        if (data.errno === 0) {
            layer.msg('ok', {icon: 1});
            setTimeout(function () {
                self.location.reload();
            }, 1000)
        } else {
            layer.msg(data.message, {icon: 2});
        }
    })
}