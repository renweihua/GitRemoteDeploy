var table;
$(function () {
    table = show_list();
    $("#search_form").submit(function () {
        table.ajax.reload();
        return false;
    })
})
var token = sessionStorage.getItem('token');

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
            $("input[name='token']").val(token);
            ajax_com($("form").serialize(), function (data) {
                if (data.errno === 0) {
                    var data = data.data;
                    $("#user_num").text(data.cnt_data);
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
                    $.each($(".deploy.disabled"), function (i, item) {
                        console.log(item);
                        var proj_id = $(item).attr('id');
                        update_btn(item, proj_id);
                    })
                } else layer.msg(data.msg, {icon: 2});
            })
        },
        "columns": [
            {data: 'proj_id'},
            {data: 'proj_name'},
            {data: 'branch'},
            {data: 'commit'},
            {data: 'option'},
        ]
    }).api();
}

function proj_edit(title, url, w, h) {
    layer_show(title, url, w, h);
}

function git(title, url, w, h) {
    layer_show(title, url, w, h);
}

function up_time(title, url, w, h) {
    layer_show(title, url, w, h);
}


/*项目-删除*/
function project_del(obj, id) {
    layer.confirm('确认要删除吗？', function (index) {
        ajax_com({"c": 'project/ctrl-del', 'proj_id': id}, function (data) {
            if (data.errno === 0) {
                $(obj).parents("tr").remove();
                layer.msg('已删除!', {icon: 1, time: 1000});
            } else {
                layer.msg(data.message, {icon: 2});
            }
        })
    });
}

function proj_update(obj, id) {
    ajax_com({"c": 'project/proj_git-update', 'proj_id': id}, function (data) {
        if (data.errno === 0) {
            $(obj).addClass('btn-default disabled');
            $(obj).html('进行中');
            $(obj).next().addClass('btn-default disabled');
            $(obj).next().next().addClass('btn-default disabled');
            update_btn(obj, id);
        } else {
            layer.msg(data.message, {icon: 2});
        }
    })
}

function update_btn(obj, id) {
    ajax_com({"c": 'project/proj_git-lock_status', 'proj_id': id}, function (data) {
        if (data.errno === 0) {
            if (data.data.status === 0) {
                location.reload();
            } else {
                if (data.data.msg !== '') {
                    layer.msg(data.data.msg, {icon: 2});
                }
                var setTime = setTimeout(function () {
                    update_btn(obj, id);
                }, 1500);
            }
        } else {
            layer.msg(data.message, {icon: 2});
        }
    })
}

