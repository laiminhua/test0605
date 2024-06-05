// 调用父级页面事件
function callFuncInMain(funcName, data) {
    var message = {
        'funcName': funcName, // 所要调用父页面里的函数名
        'param': data
    }
    // 向父窗体(用户主页面)发送消息
    // 第一个参数是具体的信息内容，
    // 第二个参数是接收消息的窗口的源（origin），即"协议 + 域名 + 端口"。也可以设为*，表示不限制域名，向所有窗口发送
    window.parent.postMessage(message, '*');
}

// 监听用户页面传回的数据 并调用 ThingJS 页面方法
window.addEventListener('message', function(e) {
    console.log('----------')
    console.log(e.data)
    console.log('----------')
    var data = e.data;
    var funcName = data.funcName;
    var param = data.param;
    // 调用 ThingJS 页面方法
    console.log(window)
    console.log(param)
    window[funcName](param);
});

//生成随机整数
function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}