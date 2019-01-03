(function ($) {
    /*
    功能：
        1.新增节点    
        2.节点拖拽
        3.删除节点同时删除线
        4.流程状态
        5.复制、粘贴、回退
        6.多选拖动
    */
    var jsPlumbInstance;
    var exampleColor = '#4385fb',
        row_id = 0;
    var defaults = {
        processData: {}, //步骤节点数据
        //processUrl:'',//步骤节点数据
        fnRepeat: function () {
            alert("步骤连接重复");
        },
        fnClick: function () {
            alert("单击");
        },
        fnDbClick: function (event) {
            event.stopPropagation();
            var labelObj = $(event.currentTarget).find(".process-label");
            var oldVal = labelObj.text().trim();
            labelObj.hide().next().val(oldVal).show().focus();
        },
        canvasMenus: {
            "one": function (t) {
                alert('画面右键')
            }
        },
        processMenus: {

        },
        /*右键菜单样式*/
        menuStyle: {
            border: '1px solid #5a6377',
            minWidth: '150px',
            padding: '5px 0'
        },
        itemStyle: {
            color: '#333',
            border: '0',
            /*borderLeft:'5px solid #fff',*/
            padding: '5px 40px 5px 20px'
        },
        itemHoverStyle: {
            border: '0',
            /*borderLeft:'5px solid #49afcd',*/
            color: '#fff',
            backgroundColor: '#5a6377'
        },
        mtAfterDrop: function (params) {
            //alert('连接成功后调用');
            //alert("连接："+params.sourceId +" -> "+ params.targetId);
        },
        sourceAnchors: [
            // [0.2, 0, 0, -1, 0, 0, "foo"],
            // [1, 0.2, 1, 0, 0, 0, "bar"],
            [0.8, 1, 0, 1, 0, 0, "baz"],
            [0, 0.8, -1, 0, 0, 0, "qux"]
        ],
        targetAnchors: [
            // [0.6, 0, 0, -1],
            // [1, 0.6, 1, 0],
            [0.4, 1, 0, 1],
            [0, 0.4, -1, 0]
        ],
        exampleDropOptions: {
            tolerance: 'touch',
            hoverClass: 'dropHover',
            activeClass: 'dragActive'
        },
        // connector: ["Bezier", {
        //     cssClass: "connectorClass",
        //     hoverClass: "connectorHoverClass"
        // }],
        // connector: ["Flowchart", {
        //     stub: [5, 5]
        // }],
        connector: ["StateMachine", {
            stub: [0, 0],
            gap: 2,
            cornerRadius: 5,
            alwaysRespectStubs: true,
            // cssClass: "connectorClass",
            // hoverClass: "connectorHoverClass"
        }],
        connectorStyle: {
            gradient: {
                stops: [
                    [0, exampleColor],
                    [0.5, '#09098e'],
                    [1, exampleColor]
                ]
            },
            strokeWidth: 1,
            lineWidth: 3,
            strokeStyle: exampleColor
        },
        hoverStyle: {
            strokeStyle: "#449999",
            lineWidth: 3,
        },
        overlays: [
            // ["Diamond", {
            //     fill: "#09098e",
            //     width: 5,
            //     length: 5
            // }],
            ["Arrow", {
                location: 1,
                id: "arrow",
                length: 10,
                foldback: 0.8,
                width: 10
            }],
            ["Label", {
                label: "",
                id: "label",
                cssClass: "labelstyle"
            }]
        ],
        endpoint: ["Dot", {
            cssClass: "endpointClass",
            radius: 6,
            hoverClass: "endpointHoverClass"
        }],
        endpointStyle: {
            fillStyle: exampleColor,
            // strokeStyle: lineColor,  //"none"
        }

    }; /*defaults end*/

    var anEndpoint = {
        endpoint: defaults.endpoint,
        paintStyle: defaults.endpointStyle,
        hoverPaintStyle: {
            fill: "#449999"
        },
        isSource: true,
        isTarget: true,
        maxConnections: -1,
        connector: defaults.connector,
        connectorStyle: defaults.connectorStyle,
        connectorHoverStyle: defaults.hoverStyle,
        connectorOverlays: defaults.overlays
    };

    /*设置隐藏域保存关系信息*/
    var aConnections = [];
    var setConnections = function (conn, remove) {
        // 判断是否已经加/减过一次了
        var aConnections = jsPlumbInstance.getAllConnections();
        var flag = false;
        if (!remove) {
            for (var i = 0, len = aConnections.length; i < len; i++) {
                if (conn.id == aConnections[i].id) {
                    flag = true;
                    break;
                }
            }
            if (!flag)
                aConnections.push(conn);
        } else {
            var idx = -1;
            for (var i = 0; i < aConnections.length; i++) {
                if (aConnections[i] == conn) {
                    idx = i;
                    break;
                }
            }
            if (idx != -1) aConnections.splice(idx, 1);
            else flag = true;
        }

        if (aConnections.length > 0) {
            var s = "";
            for (var j = 0; j < aConnections.length; j++) {
                var from = $('#' + aConnections[j].sourceId).attr('process_id');
                var target = $('#' + aConnections[j].targetId).attr('process_id');
                s = s + "<input type='hidden' value=\"" + from + "," + target + "\">";
            }
            $('#leipi_process_info').html(s);
        } else {
            $('#leipi_process_info').html('');
        }
        jsPlumb.repaintEverything(); //重画
        return flag;
    };

    /*Flowdesign */
    $.fn.Flowdesign = function (options) {
        var _canvas = $(this);
        //右键步骤的步骤号
        _canvas.append('<input type="hidden" id="leipi_active_id" value="0"/><input type="hidden" id="leipi_copy_id" value="0"/>');
        _canvas.append('<div id="leipi_process_info"></div>');

        /*配置*/
        $.each(options, function (i, val) {
            if (typeof val == 'object' && defaults[i])
                $.extend(defaults[i], val);
            else
                defaults[i] = val;
        });

        /*画布右键绑定*/
        var contextmenu = {
            bindings: defaults.canvasMenus,
            menuStyle: defaults.menuStyle,
            itemStyle: defaults.itemStyle,
            itemHoverStyle: defaults.itemHoverStyle
        }
        $(this).contextMenu('canvasMenu', contextmenu);

        jsPlumb.ready(function () {
            originStepInit(defaults.processData);

            jsPlumbInstance = jsPlumb.getInstance({
                DragOptions: {
                    cursor: 'pointer',
                    zIndex: 2000
                },
                Container: "flowdesign_canvas"
            });

            suspendDrawAndInit();
            var processInfo = Flowdesign.getProcessInfo();
            commandMgt.commandStack.push({
                fn: 'init',
                args: null,
                data: processInfo.data,
                nodeInfo: processInfo.nodeInfo
            });
        });

        multiDragInit();
        // 复制黏贴回退快捷键按键事件绑定
        keyEventBind();

        function suspendDrawAndInit() {
            jsPlumbInstance.batch(function () {

                var connections = {};
                $(".process-step").each(function (item, index) {
                    var id = $(this).attr("id");
                    var processTo = $(this).attr("process_to").trim();
                    var arr = [];
                    if (processTo != "0" && processTo != "") {
                        var toArr = processTo.split(",");
                        for (var index = 0, len = toArr.length; index < len; index++) {
                            if (toArr[index] != "") {
                                arr.push("window" + toArr[index]);
                            }
                        }
                    }
                    connections[id] = arr;
                });

                var endpoints = {},
                    divsWithWindowClass = jsPlumb.getSelector(".process-step");

                // add endpoints to all of these - one for source, and one for target, configured so they don't sit
                for (var i = 0; i < divsWithWindowClass.length; i++) {
                    var id = jsPlumbInstance.getId(divsWithWindowClass[i]);
                    endpoints[id] = [
                        // note the three-arg version of addEndpoint; 
                        jsPlumbInstance.addEndpoint(id, anEndpoint, {
                            anchor: defaults.targetAnchors
                        }),
                        jsPlumbInstance.addEndpoint(id, anEndpoint, {
                            anchor: defaults.targetAnchors
                        })
                    ];
                }
                // then connect everything using the connections map declared above.
                for (var e in endpoints) {
                    if (connections[e]) {
                        for (var j = 0; j < connections[e].length; j++) {
                            jsPlumbInstance.connect({
                                source: endpoints[e][0],
                                target: endpoints[connections[e][j]][1]
                            });
                        }
                    }
                }

                newEventBind();
                // configure ".window" to be draggable. 'getSelector' is a jsPlumb convenience method that allows you to
                // write library-agnostic selectors; you could use your library's selector instead, eg.
                jsPlumbInstance.draggable(divsWithWindowClass, { //stop create drag start
                    stop: function (event, ui) {
                        // console.log(event);
                        // console.log(ui);
                        // commandMgt.commandStack.push({
                        //     commandId: 1,
                        //     fn: 'drag',
                        //     data: Flowdesign.getProcessInfo(),
                        //     args: [{
                        //         sourceId: ui.helper[0].id,
                        //         originalPosition: ui.originalPosition,
                        //         curPosition: ui.position
                        //     }]
                        // });

                        dragStopHandler(event);
                        // console.log("dragstop");
                    }
                });

                jsPlumb.fire("jsPlumbDemoLoaded", jsPlumbInstance);

                setProcessInfo();
            });
        }

        function dragStopHandler(event) {
            var id = event.el.id,
                nodeId = id.substring(6);
            var processInfo = Flowdesign.getProcessInfo();
            var ori_pos = commandMgt.commandStack[commandMgt.commandStack.length - 1].nodeInfo[nodeId];
            commandMgt.commandStack.push({
                commandId: 1,
                fn: 'drag',
                args: [{
                    sourceId: id,
                    originalPosition: ori_pos,
                    curPosition: event.pos
                }],
                data: processInfo.data,
                nodeInfo: processInfo.nodeInfo,
            });
        }

        function setProcessInfo() {
            // 重置leipi_process_info的内容
            var aConnections = jsPlumbInstance.getAllConnections();
            var s = "";
            for (var j = 0; j < aConnections.length; j++) {
                var from = $('#' + aConnections[j].sourceId).attr('process_id');
                var target = $('#' + aConnections[j].targetId).attr('process_id');
                s = s + "<input type='hidden' value=\"" + from + "," + target + "\">";
            }
            $('#leipi_process_info').html(s);
        }

        function newEventBind() {
            // bind click listener; delete connections on click
            jsPlumbInstance.bind("click", function (conn) {
                jsPlumbInstance.detach(conn);
            });

            // bind beforeDetach interceptor: will be fired when the click handler above calls detach, and the user
            // will be prompted to confirm deletion.
            jsPlumbInstance.bind("beforeDetach", function (conn) {
                if (conn.backward != undefined && conn.backward == true) {
                    return true;
                } else {
                    return confirm("Delete connection?");
                }
            });

            //绑定删除connection事件
            jsPlumbInstance.bind("connectionDetached", function (info) { //jsPlumbConnectionDetached
                setConnections(info.connection, true);
                var processInfo = Flowdesign.getProcessInfo();
                commandMgt.commandStack.push({
                    commandId: 3,
                    fn: 'deleteConnection',
                    args: info.connection,
                    data: processInfo.data,
                    nodeInfo: processInfo.nodeInfo
                });
            });

            //绑定添加连接操作。画线-input text值  拒绝重复连接  jsPlumbConnection
            jsPlumbInstance.bind("connection", function (info) {
                var flag = setConnections(info.connection);
                var processInfo = Flowdesign.getProcessInfo();
                console.log(info.connection);
                commandMgt.commandStack.push({
                    commandId: 2,
                    fn: 'addConnection',
                    args: info.connection,
                    data: processInfo.data,
                    nodeInfo: processInfo.nodeInfo
                });
            });

            var timeout = null;
            $(document).on("click", ".process-step", function () {
                //激活
                _canvas.find('#leipi_active_id').val($(this).attr("process_id")),
                    clearTimeout(timeout);
                var obj = this;
                timeout = setTimeout(defaults.fnClick, 300);
            });

            $(document).on("dblclick", ".process-step", function (event) {
                clearTimeout(timeout);
                defaults.fnDbClick(event);
            });

            // 绑定流程图 文字编辑变化
            $(document).on("propertychange change", ".process-input", function () {
                var labelObj = $(this).prev();
                var oldVal = labelObj.text().trim(),
                    newVal = $(this).val();
                labelObj.text(' ' + newVal).show().next().hide();

                var processObj = $(this).parents(".process-step"),
                    sourceId = processObj.attr("id"),
                    processInfo = Flowdesign.getProcessInfo();
                commandMgt.commandStack.push({
                    commandId: 6,
                    fn: 'updateProcessTile',
                    args: [{
                        sourceId: sourceId,
                        oriLabel: oldVal,
                        curLabel: newVal
                    }],
                    data: processInfo.data,
                    nodeInfo: processInfo.nodeInfo
                });
            });
        }

        function originStepInit(processData) {
            //初始化原步骤
            var lastProcessId = 0;
            // var processData = defaults.processData;
            if (processData.list) {
                $.each(processData.list, function (i, row) {
                    var nodeDiv = document.createElement('div');
                    var nodeId = "window" + row.id,
                        badge = 'badge-inverse',
                        icon = 'icon-star';
                    if (lastProcessId == 0) //第一步
                    {
                        badge = 'badge-info';
                        icon = 'icon-play';
                    }
                    if (row.icon) {
                        icon = row.icon;
                    }
                    $(nodeDiv).attr("id", nodeId)
                        .attr("style", row.style)
                        .attr("process_to", row.process_to)
                        .attr("process_id", row.id)
                        .addClass("process-step btn btn-small")
                        .html('<span class="process-flag badge ' + badge + '"><i class="' + icon + ' icon-white"></i></span><div class="process-label">&nbsp;' + row.process_name + '</div><input class="process-input" type="text" />')
                        .mousedown(function (e) {
                            if (e.which == 3) { //右键绑定
                                _canvas.find('#leipi_active_id').val(row.id);
                                contextmenu.bindings = defaults.processMenus
                                $(this).contextMenu('processMenu', contextmenu);
                            }
                        });
                    _canvas.append(nodeDiv);
                    //索引变量
                    lastProcessId = row.id;

                    if (row.id >= row_id) {
                        row_id = row.id;
                        row_id++;
                    }

                }); //each
            }
        }

        // 初始化多选拖动
        function multiDragInit() {
            $("#rect").draggable('enable');
            $("#rect").draggable({
                scroll: false,
                onStartDrag: function (event, ui) { //start
                    begintop = $(this).offset().top;
                    beginleft = $(this).offset().left;
                },
                onDrag: function (event, ui) { //drag
                    var obj = event.data.target;
                    var endtop = obj.offsetTop;
                    var endleft = obj.offsetLeft;

                    topdiff = endtop - begintop;
                    leftdiff = endleft - beginleft;
                },
                onStopDrag: function (event, ui) { //stop
                    //重新设置容器框内元素位置
                    if (rectItems) {
                        var oriNodeInfo = commandMgt.commandStack[commandMgt.commandStack.length - 1].nodeInfo,
                            argsArr = [];
                        for (var i = 0; i < rectItems.length; i++) {
                            var sourceId = rectItems[i].id;
                            var item = $("#" + sourceId),
                                nodeId = sourceId.substring(6);
                            var offsetLeft = item.offset().left + leftdiff,
                                offsetTop = item.offset().top + topdiff;
                            item.css("top", offsetTop);
                            item.css("left", offsetLeft);
                            jsPlumbInstance.revalidate(sourceId);

                            var argsItem = {
                                sourceId: sourceId,
                                originalPosition: oriNodeInfo[nodeId],
                                curPosition: [offsetLeft, offsetTop]
                            };
                            argsArr.push(argsItem);
                        }
                        var processInfo = Flowdesign.getProcessInfo();
                        commandMgt.commandStack.push({
                            commandId: 1,
                            fn: 'drag',
                            args: argsArr,
                            data: processInfo.data,
                            nodeInfo: processInfo.nodeInfo,
                        });
                    }
                }
            });
            mutiDragEventBind();
        }

        // 多选事件绑定
        function mutiDragEventBind() {
            $("#flowdesign_canvas").mousedown(function (event) {
                down(event);
            });
            $("#flowdesign_canvas").mouseup(function (event) {
                up(event);
            });
            $("#flowdesign_canvas").mousemove(function (event) {
                move(event);
            });
        }

        //reset  start
        function _canvas_design() {
            //连接关联的步骤
            $('.process-step').each(function (i) {
                var sourceId = $(this).attr('process_id');
                var prcsto = $(this).attr('process_to');
                var toArr = prcsto.split(",");
                var processData = defaults.processData;
                $.each(toArr, function (j, targetId) {

                    if (targetId != '' && targetId != 0) {
                        //检查 source 和 target是否存在
                        var is_source = false,
                            is_target = false;
                        $.each(processData.list, function (i, row) {
                            if (row.id == sourceId) {
                                is_source = true;
                            } else if (row.id == targetId) {
                                is_target = true;
                            }
                            if (is_source && is_target)
                                return true;
                        });

                        if (is_source && is_target) {
                            jsPlumbInstance.connect({
                                source: "window" + sourceId,
                                target: "window" + targetId
                                /* ,labelStyle : { cssClass:"component label" }
                                 ,label : id +" - "+ n*/
                            });
                            return;
                        }
                    }
                })
            });
        } //_canvas_design end reset 

        // 键盘事件绑定
        function keyEventBind() {
            // 监听流程的键盘复制黏贴事件 ctrl+c,ctrl+v, 回退ctrl+z
            $(document).on("keydown", 'body', function (event) {
                if (event.ctrlKey && event.keyCode === 86) { //CTRL+V && event.altKey +alt
                    Flowdesign.paste();
                } else if (event.ctrlKey && event.keyCode === 67) { //CTRL+C && event.altKey +alt
                    Flowdesign.copy();
                } else if (event.ctrlKey && event.keyCode === 90) { //CTRL+z  回退
                    Flowdesign.rollBack();
                }
            });
        }



        //-----外部调用----------------------
        var Flowdesign = {
            addProcess: function (row, flag) {
                row.id = row_id;
                var nodeDiv = document.createElement('div');
                var nodeId = "window" + row.id,
                    badge = 'badge-inverse',
                    icon = 'icon-star';

                if (row.icon) {
                    icon = row.icon;
                }
                $(nodeDiv).attr("id", nodeId)
                    .attr("style", row.style)
                    .attr("process_to", row.process_to)
                    .attr("process_id", row.id)
                    .addClass("process-step btn btn-small")
                    .html('<span class="process-flag badge ' + badge + '"><i class="' + icon + ' icon-white"></i></span>&nbsp;' + row.process_name)
                    .mousedown(function (e) {
                        if (e.which == 3) { //右键绑定
                            _canvas.find('#leipi_active_id').val(row.id);
                            contextmenu.bindings = defaults.processMenus
                            $(this).contextMenu('processMenu', contextmenu);
                        }
                    });

                _canvas.append(nodeDiv);

                jsPlumbInstance.addEndpoint(nodeId, anEndpoint, {
                    anchor: defaults.targetAnchors
                });
                jsPlumbInstance.addEndpoint(nodeId, anEndpoint, {
                    anchor: defaults.targetAnchors
                });

                jsPlumbInstance.draggable(nodeId, { //stop create drag start
                    stop: function (event, ui) {
                        dragStopHandler(event);
                    }
                });

                if (flag != 1) {
                    var processInfo = Flowdesign.getProcessInfo();
                    commandMgt.commandStack.push({
                        commandId: 4,
                        fn: 'addProcess',
                        args: row,
                        data: processInfo.data,
                        nodeInfo: processInfo.nodeInfo
                    });
                }

                row_id++;
                return true;

            },
            delProcess: function (activeId, flag) {
                if (activeId <= 0) return false;
                var oriProcessInfo = Flowdesign.getProcessInfo();
                var curNode = oriProcessInfo.data[activeId];
                var id = "window" + activeId;
                jsPlumbInstance.detachAllConnections(id); //删除activeId所有连接线
                jsPlumbInstance.removeAllEndpoints(id); //删除activeId所有端点
                jsPlumbInstance.detach(id); //删除连接线
                $("#" + id).remove();
                jsPlumbInstance.repaintEverything();

                if (flag != 1) {
                    var processInfo = Flowdesign.getProcessInfo();
                    commandMgt.commandStack.push({
                        commandId: 5,
                        fn: 'delProcess',
                        args: curNode,
                        data: processInfo.data,
                        nodeInfo: processInfo.nodeInfo
                    });
                }
                return true;
            },
            getActiveId: function () {
                return _canvas.find("#leipi_active_id").val();
            },
            copy: function () {
                var active_id = _canvas.find("#leipi_active_id").val();
                _canvas.find("#leipi_copy_id").val(active_id);
                return true;
            },
            paste: function () { //new_id
                var pasteId = $("#leipi_copy_id").val();
                if (pasteId <= 0) {
                    alert("你未复制任何步骤");
                    return;
                } else {
                    var new_id = row_id;
                    var copy_id = _canvas.find("#leipi_copy_id").val();
                    var row = Flowdesign.getRowById(copy_id, new_id);
                    Flowdesign.addProcess(row);

                    //与addProcess 一样
                    var processInfo = Flowdesign.getProcessInfo();
                    commandMgt.commandStack.push({
                        commandId: 4,
                        fn: 'paste',
                        args: new_id,
                        data: processInfo.data,
                        nodeInfo: processInfo.nodeInfo
                    });
                }
            },
            getProcessInfo: function () {
                try {
                    /*连接关系*/
                    var aProcessData = {};
                    $("#leipi_process_info input[type=hidden]").each(function (i) {
                        var processVal = $(this).val().split(",");
                        if (processVal.length == 2) {
                            if (!aProcessData[processVal[0]]) {
                                aProcessData[processVal[0]] = {
                                    "top": 0,
                                    "left": 0,
                                    "process_to": []
                                };
                            }
                            aProcessData[processVal[0]]["process_to"].push(processVal[1]);
                        }
                    })
                    var nodeInfo = [];

                    /*位置*/
                    _canvas.find("div.process-step").each(function (i) { //生成Json字符串，发送到服务器解析
                        if ($(this).attr('id')) {
                            var pId = $(this).attr('process_id');
                            var pLeft = parseInt($(this).css('left'));
                            var pTop = parseInt($(this).css('top'));
                            var arr = $(this).find("i").attr("class").split(" "),
                                icon_str = '';
                            if (arr[0].trim() != "icon-white")
                                icon_str = arr[0].trim();
                            else icon_str = arr[1].trim();

                            var sig_style = $(this).attr("style").split(";"),
                                new_style = '';
                            for (var i = 0, len = sig_style.length; i < len; i++) {
                                if (sig_style[i] != "") {
                                    var arr1 = sig_style[i].split(":");
                                    if (i != 0) new_style += ';';
                                    if (arr1[0] == "top" || arr1[0] == "left") {
                                        new_style += arr1[0];
                                        new_style += ":";
                                        new_style += arr1[0] == "top" ? pTop : pLeft;
                                        new_style += "px";
                                    } else {
                                        new_style += arr1[0];
                                        new_style += ":";
                                        new_style += arr1[1];
                                    }
                                }

                            }

                            if (!aProcessData[pId]) {
                                aProcessData[pId] = {
                                    "top": 0,
                                    "left": 0,
                                    "process_to": [],
                                    "id": pId,
                                    "process_name": $(this).text().trim(),
                                    "icon": icon_str, //图标
                                    "style": new_style
                                };
                            } else {
                                aProcessData[pId] = {
                                    "top": 0,
                                    "left": 0,
                                    "process_to": aProcessData[pId]["process_to"],
                                    "id": pId,
                                    "process_name": $(this).text().trim(),
                                    "icon": icon_str, //图标
                                    "style": new_style
                                };
                            }
                            aProcessData[pId]["top"] = pTop;
                            aProcessData[pId]["left"] = pLeft;


                            nodeInfo[pId] = [pLeft, pTop];
                        }
                    });

                    // var processData = JSON.stringify(aProcessData);

                    return {
                        data: aProcessData, //processData
                        nodeInfo: nodeInfo
                    };
                } catch (e) {
                    return '';
                }



            },
            clear: function (flag) { //如果flag==1 则是其他操作的附属操作，不需要记录命令栈
                try {

                    jsPlumbInstance.detachEveryConnection();
                    jsPlumbInstance.deleteEveryEndpoint();
                    $('#leipi_process_info').html('');
                    jsPlumbInstance.repaintEverything();

                    var processInfo = Flowdesign.getProcessInfo();
                    commandMgt.commandStack.push({
                        commandId: 6,
                        fn: 'clear',
                        args: null,
                        data: processInfo.data,
                        nodeInfo: processInfo.nodeInfo
                    });
                    return true;
                } catch (e) {
                    return false;
                }
            },
            clearAll: function () {
                var line_count = $('#leipi_process_info').children().size();
                jsPlumbInstance.detachEveryConnection();
                jsPlumbInstance.deleteEveryEndpoint();
                // 删除命令栈中在清空时的删除链接操作
                for (var i = 0; i < line_count; i++) {
                    commandMgt.commandStack.pop();
                }
                $('#leipi_process_info').html('');
                jsPlumbInstance.repaintEverything();
                $(".process-step").remove();
            },
            refresh: function (flag) { //如果flag==1 则是其他操作的附属操作，不需要记录命令栈
                try {
                    //jsPlumb.reset();
                    if (flag != 1) {
                        this.clear();
                        _canvas_design();
                        var processInfo = Flowdesign.getProcessInfo();
                        commandMgt.commandStack.push({
                            fn: 'refresh',
                            args: null,
                            data: processInfo.data,
                            nodeInfo: processInfo.nodeInfo
                        });
                    } else {
                        // jsPlumb.repaintEverything();
                        // this.clearAll();
                        // this.clear(flag);
                        // _canvas_design();
                    }

                    return true;
                } catch (e) {
                    return false;
                }
            },
            getRowById: function (active_id, new_id) {
                var active_obj = $("#window" + active_id);
                var origin_top_str = active_obj.css("top"),
                    origin_left_str = active_obj.css("left");
                var new_top = 15 + parseFloat(origin_top_str.substring(0, origin_top_str.length - 2)),
                    new_left = 15 + parseFloat(origin_left_str.substring(0, origin_left_str.length - 2));
                var mTop = new_top + "px",
                    mLeft = new_left + "px",
                    mWidth = active_obj.css("width"),
                    mHeight = active_obj.css("height");
                var style = "top:" + mTop + ";left:" + mLeft + ";width:" + mWidth + ";height:" + mHeight;
                var row = {
                    "id": new_id,
                    "flow_id": "8",
                    "process_to": "",
                    "process_name": active_obj.text().trim(),
                    "icon": active_obj.find("i").attr("class").split(" ")[0],
                    "style": style
                };
                return row;
            },
            rollBack: function () {
                var command = commandMgt.rollBack();
                if (command != null) {
                    Flowdesign.executeCommand(command);
                }
            },
            resetProcessInfo: function () {
                var _html = '';
                $('.process-step').each(function (i) {
                    var sourceId = $(this).attr('process_id');
                    var prcsto = $(this).attr('process_to');
                    var toArr = prcsto.split(",");
                    $.each(toArr, function (j, targetId) {
                        if (targetId != '' && targetId != 0) {
                            _html += "<input type='hidden' value=\"" + sourceId + "," + targetId + "\">";
                        }
                    })
                });
                $('#leipi_process_info').empty().html(_html);
            },
            executeCommand: function (command) {
                switch (command.commandId) {
                    case 1: //draggable
                        var argsArr = command.args;
                        for (var index = 0, len = argsArr.length; index < len; index++) {
                            var element = argsArr[index];
                            var sourceId = element.sourceId,
                                ori_pos = element.originalPosition;
                            $("#" + sourceId).css({
                                "left": ori_pos[0],
                                "top": ori_pos[1]
                            });
                            jsPlumbInstance.revalidate(sourceId);
                        }
                        $("#rect").hide();
                        break;
                    case 2: //addConnection
                        command.args.backward = true;
                        jsPlumbInstance.detach(command.args); //deleteConnection
                        break;
                    case 3: //deleteConnection
                        var connection = command.args;
                        jsPlumbInstance.connect({
                            source: connection.sourceId,
                            target: connection.targetId
                        });
                        break;
                    case 4: //addProcess
                        Flowdesign.delProcess(command.args.id, 1);
                        break;
                    case 5: //delProcess
                        Flowdesign.addProcess(command.args, 1);
                        break;
                    case 6: //修改流程块文字
                        var args = command.args[0];
                        $("#" + args.sourceId).find(".process-label").text(" " + args.oriLabel);
                        break;
                    default:
                        break;
                }
                jsPlumb.repaintEverything(); //重画
            }
        };
        return Flowdesign;
    } //$.fn

})(jQuery);


var commandMgt = {
    commandStack: [],
    /**
     * 回退
     */
    rollBack: function () {
        var command = null;
        var index = commandMgt.commandStack.length;
        if (index == 1) {
            alert("已经到了最后一步了...");
        } else {
            command = commandMgt.commandStack.pop();
        }
        return command;
    }
}