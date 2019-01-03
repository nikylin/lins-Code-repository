// 是否需要(允许)处理鼠标的移动事件,默认识不处理
var select = false;

// 设置默认值,目的是隐藏图层
$("#rect").css("width", "0px;");
$("#rect").css("height", "0px;");
//让你要画的图层位于最上层
$("#rect").css("z-index", "200000");

// 记录鼠标按下时的坐标
var startX = 0;
var startY = 0;
// 记录鼠标抬起时候的坐标
var endX = startX;
var endY = startY;

var rectItems;

// 外部容器id
var rect_id = "flowdesign_canvas";

//处理鼠标按下事件
function down(event) {
  var obj = window.event ? event.srcElement : evt.target;
  if (obj.id == rect_id) {
    //重置容器框初始样式
    $("#rect").attr("style", "position: absolute; background-color: rgb(195, 213, 237);opacity:0.6;border: 1px dashed rgb(0, 153, 255);z-index:200000;cursor: move");
    $("#rect").empty();
    //清空框选中的项
    if (rectItems)
      rectItems.length = 0;

    // 鼠标按下时才允许处理鼠标的移动事件
    select = true;
    // 取得鼠标按下时的坐标位置
    startX = event.clientX;
    startY = event.clientY;

    //startX = event.offsetX;
    //startY = event.offsetY;

    //设置你要画的矩形框的起点位置
    $("#rect").offset().left = startX;
    $("#rect").offset().top = startY;

    //$("#rect").css("left", startX);
    //$("#rect").css("top", startY);
  }
}

//鼠标抬起事件
function up(event) {
  if (select) {
    var w = $("#rect").width();
    var h = $("#rect").height();
    if (w > 10 && h > 10) {
      $("#rect").css("display", "block");
      rectItems = new Array();

      //查找被框选中的元素  ------start
      var obj = $("#" + rect_id);
      var childs = obj.children();
      for (var i = 0; i < childs.length; i++) {
        if (childs[i].id == "rect") {
          continue;
        } else if ($(childs[i]).hasClass("process-step")) {

          var x = 0,
            y = 0;
          var child = $("#" + childs[i].id);
          var childleft = child.offset().left;
          var childtop = child.offset().top;
          //var childleft = parseInt(child.css("left").replace("px", ""));
          //var childtop = parseInt(child.css("top").replace("px", ""));

          x = childleft;
          y = childtop;

          var rectleft = parseInt($("#rect").css("left").replace("px", ""));
          var recttop = parseInt($("#rect").css("top").replace("px", ""));
          if (x > rectleft && y > recttop && (x + child.width()) < (rectleft + $("#rect").width()) &&
            (y + child.height()) < (recttop + $("#rect").height())) {
            rectItems.push(childs[i]);

            if (child.hasClass("PanelSty_Checked")) {
              child.removeClass("PanelSty_Checked");
              child.find("#ui-resizable-nw").removeClass("ui-resizable-nw");
              child.find("#ui-resizable-n").removeClass("ui-resizable-n");
              child.find("#ui-resizable-ne").removeClass("ui-resizable-ne");
              child.find("#ui-resizable-e").removeClass("ui-resizable-n");
              child.find("#ui-resizable-se").removeClass("ui-resizable-se");
              child.find("#ui-resizable-s").removeClass("ui-resizable-s");
              child.find("#ui-resizable-sw").removeClass("ui-resizable-sw");
              child.find("#ui-resizable-sw").removeClass("ui-resizable-sw");
              child.find("#ui-resizable-w").removeClass("ui-resizable-w");
            }
          }
        }
      }
      //查找被框选中的元素  ------end

      console.log(rectItems);


      //重新设置框选容器的大小、位置，并将被框选中的元素移入框选容器   -------start
      if (rectItems.length > 0) {
        var left = 0,
          top = 0,
          maxW = 0,
          minW = 0,
          maxH = 0,
          minH = 0;
        for (var i = 0; i < rectItems.length; i++) {
          var item = $("#" + rectItems[i].id);
          var itemleft = item.offset().left;
          var itemtop = item.offset().top;
          //var itemleft = parseInt(item.css("left").replace("px", ""));
          //var itemtop = parseInt(item.css("top").replace("px", ""));

          if (i != 0) {
            if (itemleft <= left)
              left = itemleft;
            if (itemtop <= top)
              top = itemtop;

            if ((itemleft + item.width()) >= maxW)
              maxW = itemleft + item.width();
            if (itemleft <= minW)
              minW = itemleft;

            if ((itemtop + item.height()) >= maxH)
              maxH = itemtop + item.height();
            if (itemtop <= minH)
              minH = itemtop;

          } else {
            left = itemleft;
            top = itemtop;

            maxW = itemleft + item.width();
            minW = left;
            maxH = itemtop + item.height();
            minH = top;
          }
        }
        $("#rect").draggable('enable');
        // $("#rect").css("left", left);
        // $("#rect").css("top", top);
        // $("#rect").width(Math.abs(maxW - minW));
        // $("#rect").height(Math.abs(maxH - minH));
      } else {
        $("#rect").css("display", "none");
      }
      //重新设置框选容器的大小、位置，并将被框选中的元素移入框选容器   -------end
    } else {
      $("#rect").css("display", "none");
    }
  }

  //鼠标抬起,就不允许在处理鼠标移动事件
  select = false;

  AddBorder($("#rect"));
}

//鼠标移动事件,最主要的事件
function move(event) {
  /*
  这个部分,根据你鼠标按下的位置,和你拉框时鼠标松开的位置关系,可以把区域分为四个部分,根据四个部分的不同,
  我们可以分别来画框,否则的话,就只能向一个方向画框,也就是点的右下方画框.
  */
  if (select) {
    // 取得鼠标移动时的坐标位置
    endX = event.clientX;
    endY = event.clientY;

    //endX = event.offsetX;
    //endY = event.offsetY;

    var r = $("#rect");

    // 设置拉框的大小   
    $("#rect").width(Math.abs(endX - startX));
    $("#rect").height(Math.abs(endY - startY));

    $("#rect").css("display", "block");

    // A part
    if (endX < startX && endY < startY) {
      $("#rect").css("left", endX);
      $("#rect").css("top", endY);
    }

    // B part
    if (endX > startX && endY < startY) {
      $("#rect").css("left", startX);
      $("#rect").css("top", endY);
    }

    // C part
    if (endX < startX && endY > startY) {
      $("#rect").css("left", endX);
      $("#rect").css("top", startY);
    }

    // D part
    if (endX > startX && endY > startY) {
      $("#rect").css("left", startX);
      $("#rect").css("top", startY);
    }

    /*
    这两句代码是最重要的,没有这两句代码,你的拉框,就只能拉框,在鼠标松开的时候,
    拉框停止,但是不能相应鼠标的mouseup事件.那么你想做的处理就不能进行.
    这两句的作用是使当前的鼠标事件不在冒泡,也就是说,不向其父窗口传递,所以才可以相应鼠标抬起事件,
    这两行代码是拉框最核心的部分.
    */
    window.event.cancelBubble = true;
    window.event.returnValue = false;
  }

}

function AddBorder(obj) {
  $(obj).append($('<div id="ui-draggable-e1" class="ui-draggable-border" style="height: 100%; width: 5px;  right:0px;bottom: 0px; "></div>'));
  $(obj).append($('<div id="ui-draggable-n1" class="ui-draggable-border" style="height: 5px; width: 100%;  top:0px;"></div>'));
  $(obj).append($('<div id="ui-draggable-w1" class="ui-draggable-border" style="height: 100%; width: 5px; bottom: 0px;"></div>'));
  $(obj).append($('<div id="ui-draggable-s1" class="ui-draggable-border" style="height: 5px; width: 100%; bottom:0px;"></div>'));
  $(obj).append($('<div id="ui-resizable-e" class="ui-resizable-handle ui-resizable-e" style="z-index: 200000;"></div>'));
  $(obj).append($('<div id="ui-resizable-s" class="ui-resizable-handle ui-resizable-s" style="z-index: 200000;"></div>'));
  $(obj).append($('<div id="ui-resizable-se" class="ui-resizable-handle ui-resizable-se" style="z-index: 200000;"></div>'));
  $(obj).append($('<div id="ui-resizable-n" class="ui-resizable-handle ui-resizable-n" style="z-index: 200000;"></div>'));
  $(obj).append($('<div id="ui-resizable-w" class="ui-resizable-handle ui-resizable-w" style="z-index: 200000;"></div>'));
  $(obj).append($('<div id="ui-resizable-ne" class="ui-resizable-handle ui-resizable-ne" style="z-index: 200000;"></div>'));
  $(obj).append($('<div id="ui-resizable-nw" class="ui-resizable-handle ui-resizable-nw" style="z-index: 200000;"></div>'));
  $(obj).append($('<div id="ui-resizable-sw" class="ui-resizable-handle ui-resizable-sw" style="z-index: 200000;"></div>'));
}


// $(function () {
//   $("#rect").draggable('enable');
//   $("#rect").draggable({
//     // handle: "#rect",
//     // containment: "parent",
//     scroll: false,
//     onStartDrag: function (event, ui) { //start
//       begintop = $(this).offset().top;
//       beginleft = $(this).offset().left;
//     },
//     onDrag: function (event, ui) { //drag
//       // var endtop = ui.position.top;
//       // var endleft = ui.position.left;

//       var obj = event.data.target;
//       var endtop = obj.offsetTop;
//       var endleft = obj.offsetLeft;

//       topdiff = endtop - begintop;
//       leftdiff = endleft - beginleft;
//     },
//     onStopDrag: function (event, ui) { //stop
//       //重新设置容器框内元素位置
//       if (rectItems) {
//         for (var i = 0; i < rectItems.length; i++) {
//           var item = $("#" + rectItems[i].id);
//           item.css("top", item.offset().top + topdiff);
//           item.css("left", item.offset().left + leftdiff);
//         }
//       }
//     }
//   });
// });