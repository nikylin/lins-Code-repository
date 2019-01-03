/*
项目：雷劈网流程设计器
官网：http://flowdesign.leipi.org
Q 群：143263697
基本协议：apache2.0

88888888888  88                             ad88  88                ad88888ba   8888888888   
88           ""                            d8"    88               d8"     "88  88           
88                                         88     88               8P       88  88  ____     
88aaaaa      88  8b,dPPYba,   ,adPPYba,  MM88MMM  88  8b       d8  Y8,    ,d88  88a8PPPP8b,  
88"""""      88  88P'   "Y8  a8P_____88    88     88  `8b     d8'   "PPPPPP"88  PP"     `8b  
88           88  88          8PP"""""""    88     88   `8b   d8'            8P           d8  
88           88  88          "8b,   ,aa    88     88    `8b,d8'    8b,    a8P   Y8a     a8P  
88           88  88           `"Ybbd8"'    88     88      Y88'     `"Y8888P'     "Y88888P"   
                                                          d8'                                
2014-3-15 Firefly95、xinG  
*/
(function ($) {

    // 参考：/jsplumb-2.8.0/jsplumb-2.8.0/demo/dynamicAnchors/dom.html
    // /js/jsPlumb/jsplumb-2.8.0/jsplumb-2.8.0/demo/statemachine/dom.html
    var jsPlumbInstance;

    var defaults = {
        processData: {}, //步骤节点数据
        //processUrl:'',//步骤节点数据
        fnRepeat: function () {
            alert("步骤连接重复");
        },
        fnClick: function () {
            alert("单击");
        },
        fnDbClick: function () {
            alert("双击");
        },
        canvasMenus: {
            "one": function (t) {
                alert('画面右键')
            }
        },
        processMenus: {
            "one": function (t) {
                alert('步骤右键')
            }
        },
        /*右键菜单样式*/
        menuStyle: {
            border: '1px solid #5a6377',
            minWidth: '150px',
            padding: '5px 0'
        },
        itemStyle: {
            fontFamily: 'verdana',
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
        //这是连接线路的绘画样式
        connectorPaintStyle: {
            lineWidth: 1,
            strokeStyle: "#49afcd",
            joinstyle: "round"
        },
        //鼠标经过样式
        connectorHoverStyle: {
            lineWidth: 3,
            strokeStyle: "#da4f49"
        },
        dropOptions: {
            tolerance: 'touch',
            hoverClass: 'dropHover',
            activeClass: 'dragActive'
        },
        connector: ["Bezier", {
            cssClass: "connectorClass",
            hoverClass: "connectorHoverClass"
        }],
        connectorStyle: {
            gradient: {
                stops: [
                    [0, "#4385fb"],
                    [0.5, '#09098e'],
                    [1, "#4385fb"]
                ]
            },
            strokeWidth: 1,
            lineWidth: 3,
            stroke: "#4385fb"
        },
        hoverStyle: {
            stroke: "#449999"
        },
        overlays: [
            ["Diamond", {
                fill: "#09098e",
                width: 20,
                length: 20
            }]
        ],
        endpoint: ["Dot", {
            cssClass: "endpointClass",
            radius: 10,
            hoverClass: "endpointHoverClass"
        }],
        endpointStyle: {
            fill: "#4385fb"
        }

    }; /*defaults end*/

    // var sourceAnchors = [
    //     [0.2, 0, 0, -1, 0, 0, "foo"],
    //     [1, 0.2, 1, 0, 0, 0, "bar"],
    //     [0.8, 1, 0, 1, 0, 0, "baz"],
    //     [0, 0.8, -1, 0, 0, 0, "qux"]
    // ];

    // var anEndpoint = {
    //     endpoint: defaults.endpoint,
    //     paintStyle: defaults.endpointStyle,
    //     hoverPaintStyle: {
    //         fill: "#449999"
    //     },
    //     // scope: "green",
    //     isSource: true,
    //     isTarget: true,
    //     // reattach: true,
    //     maxConnections: -1,
    //     connector: defaults.connector,
    //     connectorStyle: defaults.connectorStyle,
    //     connectorHoverStyle: defaults.hoverStyle,
    //     connectorOverlays: defaults.overlays,
    //     beforeDrop: function (params) {
    //         if (params.sourceId == params.targetId) return false; /*不能链接自己*/
    //         var j = 0;
    //         $('#leipi_process_info').find('input').each(function (i) {
    //             var str = $('#' + params.sourceId).attr('process_id') + ',' + $('#' + params.targetId).attr('process_id');
    //             if (str == $(this).val()) {
    //                 j++;
    //                 return;
    //             }
    //         })
    //         if (j > 0) {
    //             defaults.fnRepeat();
    //             return false;
    //         } else {
    //             mtAfterDrop(params);
    //             return true;
    //         }
    //         // return confirm("Connect " + params.sourceId + " to " + params.targetId + "?");
    //     }
    // };


    var sourceAnchors = [
            [0.2, 0, 0, -1, 0, 0, "foo"],
            [1, 0.2, 1, 0, 0, 0, "bar"],
            [0.8, 1, 0, 1, 0, 0, "baz"],
            [0, 0.8, -1, 0, 0, 0, "qux"]
        ],
        targetAnchors = [
            [0.6, 0, 0, -1],
            [1, 0.6, 1, 0],
            [0.4, 1, 0, 1],
            [0, 0.4, -1, 0]
        ],

        exampleColor = '#00f',
        exampleDropOptions = {
            tolerance: 'touch',
            hoverClass: 'dropHover',
            activeClass: 'dragActive'
        },
        connector = ["Bezier", {
            cssClass: "connectorClass",
            hoverClass: "connectorHoverClass"
        }],
        connectorStyle = {
            gradient: {
                stops: [
                    [0, exampleColor],
                    [0.5, '#09098e'],
                    [1, exampleColor]
                ]
            },
            strokeWidth: 5,
            stroke: exampleColor
        },
        hoverStyle = {
            stroke: "#449999"
        },
        overlays = [
            ["Diamond", {
                fill: "#09098e",
                width: 15,
                length: 15
            }]
        ],
        endpoint = ["Dot", {
            cssClass: "endpointClass",
            radius: 10,
            hoverClass: "endpointHoverClass"
        }],
        endpointStyle = {
            fill: exampleColor
        },
        anEndpoint = {
            endpoint: endpoint,
            paintStyle: endpointStyle,
            hoverPaintStyle: {
                fill: "#449999"
            },
            isSource: true,
            isTarget: true,
            maxConnections: -1,
            connector: connector,
            connectorStyle: connectorStyle,
            connectorHoverStyle: hoverStyle,
            connectorOverlays: overlays
        };



    var initEndPoints = function () {
        $(".process-flag").each(function (i, e) {
            var p = $(e).parent();
            jsPlumbInstance.makeSource($(e), { //$(e)
                parent: p,
                anchor: "Continuous",
                endpoint: ["Dot", {
                    radius: 1
                }],
                connector: ["Flowchart", {
                    stub: [5, 5]
                }],
                connectorStyle: defaults.connectorStyle,
                hoverPaintStyle: defaults.connectorHoverStyle,
                dragOptions: {},
                maxConnections: -1
            });
        });

    }

    /*设置隐藏域保存关系信息*/
    var aConnections = [];
    var setConnections = function (conn, remove) {
        // 判断是否已经加/减过一次了
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

        // if (!remove) {
        //     commandMgt.commandStack.push({
        //         fn: 'addConnection',
        //         args: null,
        //         data: Flowdesign.getProcessInfo()
        //     });
        // } else {
        //     commandMgt.commandStack.push({
        //         fn: 'removeConnection',
        //         args: null,
        //         data: Flowdesign.getProcessInfo()
        //     });
        // }
        return flag;
    };

    /*Flowdesign 命名纯粹为了美观，而不是 formDesign */
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

        // jsPlumb.importDefaults({
        //     DragOptions: {
        //         cursor: 'pointer'
        //     },
        //     EndpointStyle: {
        //         fillStyle: '#225588'
        //     },
        //     Endpoint: ["Dot", {
        //         radius: 1
        //     }],
        //     ConnectionOverlays: [
        //         ["Arrow", {
        //             location: 1
        //         }],
        //         ["Label", {
        //             location: 0.1,
        //             id: "label",
        //             cssClass: "aLabel"
        //         }]
        //     ],
        //     Anchor: 'Continuous',
        //     ConnectorZIndex: 5,
        //     HoverPaintStyle: defaults.connectorHoverStyle
        // });

        jsPlumb.ready(function () {


            originStepInit(defaults.processData);

            // jsPlumbInstance = jsPlumb.getInstance({
            //     // set default anchors.  the 'connect' calls below will pick these up, and in fact setting these means
            //     // that you also do not need to supply anchor definitions to the makeSource or makeTarget functions. 
            //     Anchors: [sourceAnchors, "TopCenter"],
            // });

            // jsPlumbInstance = jsPlumb.getInstance({
            //     Container: "flowdesign_canvas",
            //     DragOptions: {
            //         cursor: 'pointer',
            //         zIndex: 2000
            //     },
            //     Endpoint: defaults.endpoint,
            //     EndpointStyle: defaults.endpointStyle,
            //     ConnectionOverlays: [
            //         ["Arrow", {
            //             location: 1
            //         }],
            //         ["Label", {
            //             location: 0.1,
            //             id: "label",
            //             cssClass: "aLabel"
            //         }]
            //     ],
            //     Anchor: 'Continuous',
            //     ConnectorZIndex: 5,
            //     // default to a gradient stroke from blue to green.  for IE provide all green fallback.
            //     PaintStyle: {
            //         gradient: {
            //             stops: [
            //                 [0, "#0d78bc"],
            //                 [1, "#558822"]
            //             ]
            //         },
            //          lineWidth: 3,
            //         strokeStyle: "#558822"
            //     },
            //     HoverPaintStyle: defaults.connectorHoverStyle
            // });

            var instance = jsPlumb.getInstance({
                DragOptions: {
                    cursor: 'pointer',
                    zIndex: 2000
                },
                Container: "flowdesign_canvas"
            });

            eventBind();

            _canvas_design();
        });

        function suspendDrawAndInit() {
            jsPlumbInstance.batch(function () {

                var connections = {
                        "dynamicWindow1": ["dynamicWindow4"],
                        "dynamicWindow3": ["dynamicWindow1"],
                        "dynamicWindow5": ["dynamicWindow3"],
                        "dynamicWindow6": ["dynamicWindow5"],
                        "dynamicWindow2": ["dynamicWindow6"],
                        "dynamicWindow4": ["dynamicWindow2"]

                    },
                    endpoints = {},
                    // ask jsPlumb for a selector for the window class
                    divsWithWindowClass = jsPlumb.getSelector(".process-step");

                // add endpoints to all of these - one for source, and one for target, configured so they don't sit
                // on top of each other.
                for (var i = 0; i < divsWithWindowClass.length; i++) {
                    var id = jsPlumbInstance.getId(divsWithWindowClass[i]);
                    endpoints[id] = [
                        // note the three-arg version of addEndpoint; lets you re-use some common settings easily.
                        jsPlumbInstance.addEndpoint(id, anEndpoint, {
                            anchor: sourceAnchors
                        }),
                        jsPlumbInstance.addEndpoint(id, anEndpoint, {
                            anchor: targetAnchors
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

                // bind click listener; delete connections on click
                jsPlumbInstance.bind("click", function (conn) {
                    jsPlumbInstance.detach(conn);
                });

                // bind beforeDetach interceptor: will be fired when the click handler above calls detach, and the user
                // will be prompted to confirm deletion.
                jsPlumbInstance.bind("beforeDetach", function (conn) {
                    return confirm("Delete connection?");
                });

                //
                // configure ".window" to be draggable. 'getSelector' is a jsPlumb convenience method that allows you to
                // write library-agnostic selectors; you could use your library's selector instead, eg.
                //
                // $(".window")  		jquery
                // $$(".window") 		mootools
                // Y.all(".window")		yui3
                //
                jsPlumbInstance.draggable(divsWithWindowClass);

                jsPlumb.fire("jsPlumbDemoLoaded", jsPlumbInstance);
            });
        }

        // function getJSInstance(id){

        // }


        // if ($.support.msie && $.support.version < '9.0') { //ie9以下，用VML画图  1.3.16支持，3.8.0不支持
        //     jsPlumb.setRenderMode(jsPlumb.VML);
        // } else { //其他浏览器用SVG
        //     jsPlumb.setRenderMode(jsPlumb.SVG);
        // }

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
                        .html('<span class="process-flag badge ' + badge + '"><i class="' + icon + ' icon-white"></i></span>&nbsp;' + row.process_name)
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
                }); //each
            }
        }



        function dragEventBind() {
            //使之可拖动
            jsPlumbInstance.draggable(jsPlumb.getSelector(".process-step"), { //stop create drag start
                stop: function (event, ui) {
                    commandMgt.commandStack.push({
                        fn: 'drag',
                        args: null,
                        data: Flowdesign.getProcessInfo(),
                        info: [{
                            sourceId: ui.helper[0].id,
                            originalPosition: ui.originalPosition,
                            curPosition: ui.position
                        }]
                    });
                    // console.log("dragstop");
                }
            });
        }

        function dropSetBind() {
            jsPlumbInstance.makeTarget(jsPlumb.getSelector(".process-step"), { // .process-flag
                dropOptions: {
                    hoverClass: "hover",
                    activeClass: "active"
                },
                anchor: "Continuous",
                maxConnections: -1,
                endpoint: ["Dot", {
                    radius: 1
                }],
                paintStyle: {
                    fillStyle: "#ec912a",
                    radius: 1
                },
                hoverPaintStyle: this.connectorHoverStyle,
                beforeDrop: function (params) {
                    if (params.sourceId == params.targetId) return false; /*不能链接自己*/
                    var j = 0;
                    $('#leipi_process_info').find('input').each(function (i) {
                        var str = $('#' + params.sourceId).attr('process_id') + ',' + $('#' + params.targetId).attr('process_id');
                        if (str == $(this).val()) {
                            j++;
                            return;
                        }
                    })
                    if (j > 0) {
                        defaults.fnRepeat();
                        return false;
                    } else {
                        mtAfterDrop(params);
                        return true;
                    }
                }
            });
        }


        function eventBind() {
            var timeout = null;
            //点击或双击事件,这里进行了一个单击事件延迟，因为同时绑定了双击事件
            $(".process-step").bind('click', function () {
                //激活
                _canvas.find('#leipi_active_id').val($(this).attr("process_id")),
                    clearTimeout(timeout);
                var obj = this;
                timeout = setTimeout(defaults.fnClick, 300);
            }).bind('dblclick', function () {
                clearTimeout(timeout);
                defaults.fnDbClick();
            });

            dragEventBind();
            // initEndPoints();

            //绑定添加连接操作。画线-input text值  拒绝重复连接  jsPlumbConnection
            jsPlumbInstance.bind("connection", function (info) {
                var flag = setConnections(info.connection);
                if (!flag) {
                    commandMgt.commandStack.push({
                        fn: 'addConnection',
                        args: null,
                        data: Flowdesign.getProcessInfo(),
                    });
                }

            });
            //绑定删除connection事件
            jsPlumbInstance.bind("connectionDetached", function (info) { //jsPlumbConnectionDetached
                var flag = setConnections(info.connection, true);
                if (!flag) {
                    commandMgt.commandStack.push({
                        fn: 'removeConnection',
                        args: null,
                        data: Flowdesign.getProcessInfo(),
                    });
                }
            });
            //绑定删除确认操作
            jsPlumbInstance.bind("click", function (c) {
                if (confirm("你确定取消连接吗?"))
                    jsPlumbInstance.detach(c);
            });
            setEndPoint();
            // dropSetBind();


        }

        // 设置连接锚点
        function setEndPoint() {
            var exampleColor = "#00f";
            // configure some drop options for use by all endpoints.
            var exampleDropOptions = {
                    tolerance: "touch",
                    hoverClass: "dropHover",
                    activeClass: "dragActive"
                },
                maxConnectionsCallback = function (info) {
                    alert("Cannot drop connection " + info.connection.id + " : maxConnections has been reached on Endpoint " + info.endpoint.id);
                };

            $('.process-step').each(function (i) {
                var id = $(this).attr("id");
                jsPlumbInstance.addEndpoint(id, anEndpoint, {
                    anchor: sourceAnchors
                });
                // e1.bind("maxConnections", maxConnectionsCallback);  
            });
        }




        //连接成功回调函数
        function mtAfterDrop(params) {
            //console.log(params)
            defaults.mtAfterDrop({
                sourceId: $("#" + params.sourceId).attr('process_id'),
                targetId: $("#" + params.targetId).attr('process_id')
            });
            // Flowdesign.resetProcessInfo();
            // commandMgt.commandStack.push({
            //     fn: 'addConnection',
            //     args: null,
            //     data: Flowdesign.getProcessInfo(),
            // });

        }



        //reset  start
        var _canvas_design = function () {
            //连接关联的步骤
            $('.process-step').each(function (i) {
                var sourceId = $(this).attr('process_id');
                //var nodeId = "window"+id;
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


        //-----外部调用----------------------

        var Flowdesign = {
            addProcess: function (row) {
                if (row.id <= 0) {
                    return false;
                }
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
                //使之可拖动 和 连线
                // dragEventBind();
                // jsPlumb.draggable(jsPlumb.getSelector(".process-step"), { //stop create drag start
                //     stop: function (event, ui) {
                //         commandMgt.commandStack.push({
                //             fn: 'drag',
                //             args: null,
                //             data: Flowdesign.getProcessInfo(),
                //             info: [{
                //                 sourceId: ui.helper[0].id,
                //                 originalPosition: ui.originalPosition,
                //                 curPosition: ui.position
                //             }]
                //         });
                //     }
                // });
                // initEndPoints();
                //使可以连接线
                // dropSetBind();
                // jsPlumb.makeTarget(jsPlumb.getSelector(".process-step"), {
                //     dropOptions: {
                //         hoverClass: "hover",
                //         activeClass: "active"
                //     },
                //     anchor: "Continuous",
                //     maxConnections: -1,
                //     endpoint: ["Dot", {
                //         radius: 1
                //     }],
                //     paintStyle: {
                //         fillStyle: "#ec912a",
                //         radius: 1
                //     },
                //     hoverPaintStyle: this.connectorHoverStyle,
                //     beforeDrop: function (params) {
                //         var j = 0;
                //         $('#leipi_process_info').find('input').each(function (i) {
                //             var str = $('#' + params.sourceId).attr('process_id') + ',' + $('#' + params.targetId).attr('process_id');
                //             if (str == $(this).val()) {
                //                 j++;
                //                 return;
                //             }
                //         })
                //         if (j > 0) {
                //             defaults.fnRepeat();
                //             return false;
                //         } else {
                //             return true;
                //         }
                //     }
                // });

                eventBind();

                commandMgt.commandStack.push({
                    fn: 'addProcess',
                    args: row,
                    data: Flowdesign.getProcessInfo()
                });
                return true;

            },
            delProcess: function (activeId) {
                if (activeId <= 0) return false;
                // jsPlumb.remove(activeId);
                // $("#window" + activeId).remove();

                jsPlumbInstance.detachAllConnections("window" + activeId); //删除activeId所有连接线
                jsPlumbInstance.removeAllEndpoints("window" + activeId); //删除activeId所有端点
                jsPlumbInstance.detach("window" + activeId); //删除连接线
                $("#window" + activeId).remove();
                jsPlumbInstance.repaintEverything();

                // jsPlumb.remove(activeId); //移除节点

                // var conns = jsPlumb.getConnections({
                //     source: "window" + activeId
                // });
                // for (var i = 0; i < conns.length; i++)
                //     jsPlumb.detach(conns[i]);

                // jsPlumb.remove("window" + activeId);
                // jsPlumb.remove(activeId);
                // jsPlumb.deleteEveryEndpoint();

                commandMgt.commandStack.push({
                    fn: 'delProcess',
                    args: activeId,
                    data: Flowdesign.getProcessInfo()
                });

                return true;
            },
            getActiveId: function () {
                return _canvas.find("#leipi_active_id").val();
            },
            copy: function (active_id) {
                if (!active_id)
                    active_id = _canvas.find("#leipi_active_id").val();

                _canvas.find("#leipi_copy_id").val(active_id);
                return true;
            },
            paste: function (new_id) {
                var copy_id = _canvas.find("#leipi_copy_id").val();
                var row = Flowdesign.getRowById(copy_id, new_id);
                Flowdesign.addProcess(row);

                commandMgt.commandStack.push({
                    fn: 'paste',
                    args: new_id,
                    data: Flowdesign.getProcessInfo()
                });

                // return _canvas.find("#leipi_copy_id").val();
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

                        }
                    })
                    return JSON.stringify(aProcessData);
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

                    commandMgt.commandStack.push({
                        fn: 'clear',
                        args: null,
                        data: Flowdesign.getProcessInfo()
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
                        commandMgt.commandStack.push({
                            fn: 'refresh',
                            args: null,
                            data: Flowdesign.getProcessInfo()
                        });
                    } else {
                        this.clearAll();
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
            reloadData: function (data) {
                var data_arr = JSON.parse(data);
                defaults.processData.list = data_arr;
                this.clearAll();
                // Flowdesign.refresh(1);

                //初始化原步骤
                var processData = {
                    total: data.split('"process_to"').length - 1,
                    list: data_arr
                };
                originStepInit(processData);
                // if (processData.list) {
                //     $.each(processData.list, function (i, row) {
                //         var nodeDiv = document.createElement('div');
                //         var nodeId = "window" + row.id,
                //             badge = 'badge-inverse',
                //             icon = 'icon-star';
                //         if (lastProcessId == 0) //第一步
                //         {
                //             badge = 'badge-info';
                //             icon = 'icon-play';
                //         }
                //         if (row.icon) {
                //             icon = row.icon;
                //         }
                //         $(nodeDiv).attr("id", nodeId)
                //             .attr("style", row.style)
                //             .attr("process_to", row.process_to)
                //             .attr("process_id", row.id)
                //             .addClass("process-step btn btn-small")
                //             .html('<span class="process-flag badge ' + badge + '"><i class="' + icon + ' icon-white"></i></span>&nbsp;' + row.process_name)
                //             .mousedown(function (e) {
                //                 if (e.which == 3) { //右键绑定
                //                     _canvas.find('#leipi_active_id').val(row.id);
                //                     contextmenu.bindings = defaults.processMenus
                //                     $(this).contextMenu('processMenu', contextmenu);
                //                 }
                //             });
                //         _canvas.append(nodeDiv);
                //         //索引变量
                //         lastProcessId = row.id;
                //     }); //each
                // }

                eventBind();
                _canvas_design();
                // commandMgt.commandStack.pop();
                var line_count = $('#leipi_process_info').children().size();
                // 删除命令栈中在重绘时的添加链接操作
                for (var i = 0; i < line_count; i++) {
                    commandMgt.commandStack.pop();
                }
            },
            rollBack: function () {
                var command = commandMgt.rollBack();
                if (command != null) {
                    Flowdesign.reloadData(command.data);
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
            }
        };



        commandMgt.commandStack.push({
            fn: 'init',
            args: null,
            data: Flowdesign.getProcessInfo()
        });

        return Flowdesign;


    } //$.fn




    // var commandMgt = {
    //     commands: {  
    //         'addProcess': {
    //             fn: 'addProcess',
    //             args: [1],
    //         },
    //         'delProcess': {
    //             fn: 'delProcess',
    //             args: [2]
    //         },
    //         'copy': {
    //             fn: 'copy',
    //             args: [2]
    //         },
    //         'paste': {
    //             fn: 'paste',
    //             args: [2]
    //         },
    //         'clear': {
    //             fn: 'clear',
    //             args: []
    //         },
    //         'refresh': {
    //             fn: 'refresh',
    //             args: []
    //         },
    //     },
    //     commandStack: [],
    //     init: function () {

    //     },
    //     // 利用闭包存储任务并赋予角色动作
    //     makeCommand: function (receiver, state) {
    //         return function () {
    //             receiver[state].apply(Flowdesign, arguments)
    //         }
    //     },
    //     // 执行角色任务及将存储的任务压入回放任务队列
    //     runAndPushStack: function (key) {
    //         var command = commandMgt.makeCommand(Flowdesign, commands[key]['fn']),
    //             args = commands[key]['args'];

    //         if (command) {
    //             commandMgt.commandStack.push({
    //                 fn: command,
    //                 args: args || [],
    //                 // delay: (new Date()).getTime() - delay // 传入每次动作距离开始时间延迟
    //             });
    //             command.apply(Flowdesign, args);
    //         }
    //     }
    // };

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
            commandMgt.commandStack.pop();
            command = commandMgt.commandStack[commandMgt.commandStack.length - 1];
        }
        return command;
    }
}