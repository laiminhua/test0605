const campusUrl = [{
    name: "丰潭路园区",
    url: "./scene/1/"
}, {
    name: "园区2",
    url: ""
}];

// 加载场景代码 初始化
const app = new THING.App({ resourceLibraryUrl: "./", 
   url: campusUrl[0].url
});

// 加载场景后执行
// app.on('load', function () {
//     new THING.widget.Button('添加图标', test);
//     new THING.widget.Button('添加无人机监测设备效果', addRadarEffect);
//     new THING.widget.Button('清除无人机监测设备效果', removeRadarEffect);
//     new THING.widget.Button('切换下雨天', changeWeather);
//     new THING.widget.Button('聚焦设备', clickDevice);
// });

function test () {
    addTestMarker()
}

let curCampus = {}; //当前园区对象
const perPosition = { //记录摄像机位置 用于返回操作
    position: [],
    target: []
}; 
let markerList = [] // 当前所展示设备点图标合集（用于记录便于清除）
let randerMarker = {}
let carTimer = null
let carOb = {}

// 背景图
var bg = './uploads/wechat/oLX7p01TFSqr8hXrrSZJGYVIpQIc/file/浙江省廉政教育基地/assets/bg.png'

// 环境光对象
var ambientLight = {
    intensity:0.4,
    color: '16777215',
};
// 半球光照
var hemisphereLight = {
    intensity:0,
    color: '16777215',
    groundColor: '2236962',
};
// 主灯光对象
var mainLight = {
    shadow:true,
    intensity:1.1,
    color: '16777215',
    alpha:60,
    beta:30,
    shadowBias:0,
    shadowNormalBias:0,
};
// 第二光源对象
var secondaryLight = {
    shadow:false,
    intensity:0,
    color: '16777215',
    alpha:138,
    beta:0,
};
// 全局配置
var config = {
    showHelper:false,
    ambientLight,
    hemisphereLight,
    mainLight,
    secondaryLight
};
app.lighting = config;



// 指南针控件
const ctrl = app.addControl(new THING.CompassControl({
    'position': THING.CornerType.LeftTop, // 选填 默认值 RightBottom 可填写 RightTop LeftTop LeftBottom
    'opacity': 0.8, // 不透明度
    'offset': [550, -80], // 选填 偏移值 x y
    'image': './static/images/compass.png',
    'size': 50 // 大小
}));

/**
 * 切换场景
 */
function changeScene(type) {
    const url = curCampus.url;  //　当前园区url
    // 动态创建园区
    if (type === 0) {
        createCampus(campusUrl[0]);
    } else {
        createCampus(campusUrl[1],type);
    }
}

/**
 * 创建园区
 */
function createCampus(obj,type)  {
     $(".loading").css("display", "flex");//开启loading界面
    app.create({
        type: "Campus",
        url: obj.url,
        position: [0, 0, 0],
        visible: false, // 创建园区过程中隐藏园区
        complete: function (ev) {
            $(".loading").css("display", "none");//关闭loading界面
            curCampus.destroy();  // 新园区创建完成后删除之前的
            curCampus = ev.object;  // 将新园区赋给全局变量
            curCampus.fadeIn();  // 创建完成后显示（渐现）
            app.level.change(curCampus) // 开启层级切换
            // app.resumeEvent(THING.EventType.Click,  null, THING.EventTag.LevelBackOperation); //禁用右键返回
            setTimeout(() => {
                    app.level.change(ev.object, {
                    complete: function() {
                        cleanParticle()
                        init()
                        actionListener()
                        callFuncInMain('onSceneChanged', type)
                    }
                });
            },1000)
        }
    });
}

/**
 * 设置初始化loading动画
 */
function loadingPage() {
    const template =
        `
        <div class="loading" id="animation_1661755711278" style="color:rgb(255,255,255);background: rgba(28,30,32,1);
             width:100%;position:fixed;display:flex;justify-content:center;left:0px;top:0px;height:100vh;
             flex-direction:column;z-index:100000;align-items:center;user-select:none;">
            <div >
                <img alt="加载中" src="./uploads/wechat/oLX7p01TFSqr8hXrrSZJGYVIpQIc/file/浙江省廉政教育基地/assets/load.png
" style="width:160px;height:140px;">
                <div id="loadingProgressPrefix" style="color:rgba(255,255,255,0.7);font-family:PingFangSC-Regular, 'PingFang SC', sans-serif;
                font-size:14px;fopnt-weight:400;line-height: 14px;text-align:center;">
                正在加载，请稍后...</div>
            </div>
        </div>
        `;
    // 插入到 ThingJS 内置的 2D 界面 div 中
    $('#div2d').append($(template));
}

loadingPage()

// 引用效果模板组件脚本
THING.Utils.dynamicLoad([
    './uploads/wechat/oLX7p01TFSqr8hXrrSZJGYVIpQIc/file/浙江省廉政教育基地/css/main.css',
    './uploads/wechat/oLX7p01TFSqr8hXrrSZJGYVIpQIc/file/浙江省廉政教育基地/util.js',
], function () {
    app.on('load', function (ev) {
        $(".loading").css("display", "none");//关闭启动界面
        curCampus = ev.campus;
        app.level.change(ev.campus);
        // app.lighting = config;
        init()
        // createRadarMarker()
       //关闭，进到室内自动切换天空盒  
        // app.pauseEvent(THING.EventType.LeaveLevel, '.Campus', THING.EventTag.LevelSceneOperations);
        // app.level.options['autoChangeBackground'] = false;
       //限制旋转角度
       app.camera.xAngleLimitRange = [0, 90]; 
       //限制最大视角
       app.camera.distanceLimited  = [0,180]
       //获取园区
       c = app.query('.Campus')[0];
       //执行自动旋转
         actionListener()
        //
        //  addBuildingMarker()
         callFuncInMain('onSceneChanged', 0)
    })
})

// 进入园区
app.on(THING.EventType.EnterLevel, '.Campus', function (ev) {
    changeWeather('0')
    addCarEvent()
    if ($('.bdMarker').length) {
        showBdmarker()
    }
    callFuncInMain('setLevel', '0')
});

//离开园区
app.on(THING.EventType.LeaveLevel, '.Campus', function () {
    console.log('离开园区场景')
    removeCarEvent()
    hideBdMarker()
    cleanParticle()
    removeRadarEffect()
})

// 进入楼栋
app.on(THING.EventType.EnterLevel, '.Building', function (ev) {
    console.log(ev)
    callFuncInMain('setLevel', '1')
    const obj = ev.object;
    if (bg) {
        app.background = bg;
    }
    //展开楼层
    ev.current.expandFloors({
        'time': 0,
        'distance': 5,
        'complete': function () {
            console.log('ExpandFloor complete ');
            app.camera.flyTo({
                object: obj,
                xAngle: 0, // 绕物体自身X轴旋转角度
                yAngle: -60, // 绕物体自身Y轴旋转角度
                radiusFactor: 1.2, // 物体包围盒半径的倍数
                time: 1000,
                complete: function () {
                    cb()
                }
            });
        }
    });
    const cb = () => {
        const floors = obj.query('.Floor')
        addFloorsMarker(floors)
    }
    
}, 'customEnterBuildingOperations');

//离开楼栋
 app.on(THING.EventType.LeaveLevel, '.Building', function (ev) {
    
    var previous = ev.previous;
    //收拢楼层
    previous.unexpandFloors({
        'time': 500,
        'complete': function () {
            console.log('UnexpandFloor complete ');
        }
    });
    cleanFlMarker() 
}, 'customEnterBuildingOperations');

//进入楼层
app.on(THING.EventType.EnterLevel, '.Floor', function (ev) {
    console.log(ev.object)
    callFuncInMain('setLevel', '2')
    if (bg) {
        app.background = bg;
    }
    const obj = ev.object;
    let focusObj = obj
    let isRoom = false
    switch (obj.id) {
        case 'Building_A_Floor_2':
            focusObj = app.query(`#Building_A_Floor_2_jf`)[0]
            isRoom = true
            break;
        case 'Building_A_Floor_1':
            focusObj = app.query(`#Building_A_Floor_1_xks`)[0]
            isRoom = true
            break;
        case 'Building_A_Floor_-1':
            focusObj = app.query(`#Building_A_Floor_-1_gpj`)[0]
            isRoom = true
            break;
    } 
    console.log(focusObj)
    // 摄像机飞行到某位置
    app.camera.flyTo({
        'object': focusObj,
        'radiusFactor': isRoom? 2: 1,
        'time': 2000,
        'complete': function() {
        }
    });
    addFloorTag(obj)
   
}, 'customEnterBuildingOperations');

//离开楼层
app.on(THING.EventType.LeaveLevel, '.Floor', function (ev) {
    cleanFlTag()
 }, 'customEnterBuildingOperations');   
    
// 初始化样式设置
function init() {
    // // 查询所有楼层
    const floors = app.query('.Floor');
    floors.forEach((floor, index) => {
        // 设置墙体颜色和透明度
        const wall = floor.wall
        // wall.style.color = "#000000"
        wall.style.opacity = 0.4
        // 设置地板颜色和透明度
        const plan = floor.plan;
        // plan.style.color = "#000000"
        plan.style.opacity = 1

        const roof = floor.roof; // 楼层屋顶
        roof.style.opacity = 0.8; // 设置屋顶透明度
        roof.style.color = '#ffffff'
        const doors = floor.doors
        doors.forEach((item) => {
            item.style.color = '#402415'
            item.style.opacity = 0.3
        })

        if (index === 0) {
            wall.style.opacity = 0.1
        } 

    })
    // 园区外部白膜建筑
     const buildings = app.query('["userData/_createType_"=speedOutdoor_building]');
     buildings.forEach((building, index) => {
         building.style.opacity = 0.5
         const noVisibleBuildings = [
            '3583AD4E-BD0F-4CB4-AD98-90ED67E7A5ED'
         ]
         if (noVisibleBuildings.includes(building.id)) {
            building.style.opacity =  0
         }
     })

     //房间加名称
     const rooms = app.query('["userData/room"=1]');
     rooms.forEach((room, index) => {
         var roomTxt = app.create({
            type: 'TextRegion',
            parent: room,
            id: 'roomTxt' + index,
            localPosition: [0, 3, 0],
            text: room.userData.label,
            inheritStyle: false,
            inheritScale: false,
            style: {
                fontColor: '#ffffff', // 文本颜色 支持16进制颜色 和 rgb颜色
                fontSize: 12, // 文本字号大小
            }
        });
        roomTxt.rotateX(-90);
     })

     //默认隐藏雷达
     const radar = app.query('#Radar_Ring_1')[0];
    radar.pickable = false
    radar.style.opacity = 0
}


//添加楼栋标注
function addBuildingMarker(list = []) {
    console.log('addBuilidngMarker')
    cleanBdMarker()
    // const buildings = app.query('.Building')
    list.forEach((item,index) => {
        const b = app.query(`${item.name}`)[0]
        if (!b) return 
          const bdMarkerHtml =
            `<div class="bdMarker bdMarker${index}" style="position: absolute;">
                <div class="bdMarker-inner" style="" id="bd-marker-${index}">
                     <div class="title">${item.name}</div>
                     <div class="content">
                        <div class="device">
                            <div class="device-title">设备数</div>
                             <div class="device-num ">${item.value}</div>
                        </div>          
                        <div class="device">
                            <div  class="device-title">告警数</div>
                            <div class="device-num alarm" >${item.alarmValue}</div>
                        </div>
                     </div>
                </div>
            </div>`;
        $('#div3d').append($(bdMarkerHtml));
        const rsUiAnchor  = app.create({
            type: "UIAnchor",
            element: $(`.bdMarker${index}`)[0],
            localPosition: [0, 28, 0],
            parent: b,
            pivotPixel: [120,60] // 当前用值是角标的中心点 
        })

    })
}

//添加楼层列表标注
function addFloorsMarker(list = []) {
    console.log('addFloorsMarker')
    cleanFlMarker()
    list.forEach((item,index) => {
          const flMarkerHtml =
            `<div class="flMarker flMarker${index}" style="position: absolute;">
                <div class="flMarker-inner" style="" id="fl-marker-${index}">
                     <div class="title">${index === 0? -1 : index}层</div>
                </div>
            </div>`;
        $('#div3d').append($(flMarkerHtml));
        setTimeout(() => {
            const rsUiAnchor  = app.create({
                type: "UIAnchor",
                element: $(`.flMarker${index}`)[0],
                localPosition: [40, 0, 0],
                parent: item,
                pivotPixel: [94,25] // 当前用值是角标的中心点 
            })
        }, 60*index)
       

    })
}

//添加楼层标注
function addFloorTag(obj) {
    console.log('addFloorsTag')
    cleanFlTag()
    const { name:buildingName, children:floorList } = obj.parent
    const index= floorList.findIndex(item => {return item.id === obj.id})
    const template =
        `<div class="flTag " style="position: absolute;">
            <div class="flTag-inner">
                    <div class="title">${buildingName} ${index === 1? -1 : index - 1}层</div>
            </div>
        </div>`;
    $('#div2d').append($(template))

}

// 重置标注
function cleanMarker() {
    $('.rsMarker').remove()
    markerList.forEach((item) => {
        item.destroy()
    })
    markerList = []
    // curRoomLight.forEach(item => {
    //     item.plan.style.color = '#ffffff'
    // })
    // curRoomLight = []
    cleanBdMarker()
}
function cleanBdMarker() {
    $('.bdMarker').remove()
}

function cleanFlMarker() {
    $('.flMarker').remove()
}

function  cleanFlTag() {
    $('.flTag').remove()
}

function hideBdMarker() {
    $('.bdMarker').hide()
}
function showBdmarker() {
    $('.bdMarker').show()
}

//园区旋转
function around() {
    var currentLevel = app.level.current;
    //只在园区层级执行
    if (currentLevel.type !== 'Campus') return 
     app.camera.flyTo({
        target: [0, 0, 0],
        position: [69.97713725464381,95.59038988025627,-92.93866335389302],
        xAngle: 0, // 绕物体自身X轴旋转角度
        yAngle: 0, // 绕物体自身Y轴旋转角度
        radiusFactor: 1, // 物体包围盒半径的倍数
        time: 2 * 1000,
        complete: function () {
               app.camera.rotateAround({
        target: [0,0,0],// 环绕的物体 (object 与 target 的设置互斥 详见教程)
        time: 50 * 1000, // 环绕飞行的时间
        yRotateAngle: 360, // 环绕y轴飞行的旋转角度
        complete:function(){
            app.camera.flyTo({
                // object:  app.query('.Building')[0],
                target: [0, 0, 0],
                position: [144.9749719883818,21.480879031231467,28.322800230660658],
                xAngle: 0, // 绕物体自身X轴旋转角度
                yAngle: 0, // 绕物体自身Y轴旋转角度
                radiusFactor: 1.2, // 物体包围盒半径的倍数
                time: 2 * 1000,
                complete: function () {
                    app.camera.rotateAround({
                        target: [0,0,0],
                        // object: app.query('.Building')[0],// 环绕的物体 (object 与 target 的设置互斥 详见教程)
                        time: 50 * 1000, // 环绕飞行的时间
                        yRotateAngle: 360, // 环绕y轴飞行的旋转角度
                        complete:function(){
                           around()
                        }
                    });
             }
        });
        }
    });
        }
     })
}

// 监听鼠标操作间隔时间
function actionListener(){
    var count = 0;
    var outTime = 0.1; //分钟
    function go() {
        count++;
        if (count == outTime * 200 ) {
            around()
        }
    }
    //页面倒计时
    window.setInterval(go, 1000);
    //监听鼠标
    var x;
    var y;
    document.onmousemove = function(event) {
        /* Act on the event */
        var x1 = event.clientX;
        var y1 = event.clientY;
        if (x != x1 || y != y1) {
            count = 0;
        }
        x = x1;
        y = y1;
        app.camera.stopRotateAround()
    };
    document.onkeydown = function(event) {
        count = 0;
    };
}

//添加标注
function addMarker(data) {
    console.log(data)
    const {type ,list, building} = data
    cleanMarker()
    addBuildingMarker(building)
    list.forEach((item,index) => {
        console.log(item)
        const status = item.status 
        const obj = app.query(`#${item.id}`)[0]
        console.log(obj)
        if (!obj) return
        // if (status === '3') {
             const rsMarkerHtml =
                `<div class="rsMarker rsMarker${index}" style="position: absolute;z-index:99">
                    <div style="display: flex;justify-content: center;align-items:center" >
                        <div class=" ripple ${status === '3'? 'active' : ''}">
                            <span style="--i:1"></span>
                            <span style="--i:2"></span>
                            <span style="--i:3"></span>
                            <span style="--i:4"></span>
                            <span style="--i:5"></span>
                        </div>
                        <div style="width:30px;">
                            <div class="picture" id="rs-marker-${item.id}" style="height: 40px;width: 30px;cursor:pointer">
                                <img src='./uploads/wechat/oLX7p01TFSqr8hXrrSZJGYVIpQIc/file/浙江省廉政教育基地/assets/${item.type}-${item.status}.png' style="height: 100%;width: 100%;">
                            </div>
                        </div>
                    </div>
                </div>`;
            $('#div3d').append($(rsMarkerHtml));
             // 创建高亮标记
            const rsUiAnchor  = app.create({
                type: "UIAnchor",
                element: $(`.rsMarker${index}`)[0],
                localPosition: [0, 0.5, 0],
                parent: obj,
                pivotPixel: [15,30] // 当前用值是角标的中心点 
            })
             $(`#rs-marker-${item.id}`).on('click', () =>{
                callFuncInMain('pickDevice', {
                    id: item.id,
                    status: status,
                    alarmId: item.alarmId,
                    type: item.type
                });
                // 记录摄像机位置
                perPosition.position = app.camera.position
                perPosition.target = app.camera.target
                const obj = app.query(`#${item.id}`)[0]
                app.camera.flyTo({
                    object: obj,
                    radiusFactor: 4,
                    time: 1000,
                    complete: () => {}
                })
            })
        // } 
        // else {
            
        //      const marker = app.create({
        //         type: "Marker",
        //         id: `rs-marker-${item.id}`,
        //         url: `./uploads/wechat/oLX7p01TFSqr8hXrrSZJGYVIpQIc/file/浙江省廉政教育基地/assets/${item.type}-${item.status}.png`,
        //         localPosition: [0, 1, 0],
        //         parent: obj,
                
        //         size: 4,
               
        //         style: {
        //             skipBoundingBox: true,  //取消子物体（顶牌）对父物体包围盒的影响
        //         },
        //         keepSize: true
        //     }).on('click', function () {
        //         callFuncInMain('pickDevice', {
        //                 id: item.id,
        //                 status: status,
        //                 alarmId: item.alarmId,
        //                 type: type
        //             });
        //         perPosition.position = app.camera.position
        //         perPosition.target = app.camera.target
        //         // const obj = app.query(`#${item.id}`)[0]
        //         app.camera.flyTo({
        //             object: obj,
        //             radiusFactor: 5,
        //             time: 1000,
        //             complete: () => {}
        //         })
        //     });
        //     markerList.push(marker)
        //     console.log(markerList)
        // }
    })
}

// 回到上一个视角
function backCamera() {
     app.camera.flyTo({
        'position': perPosition.position,
        'target': perPosition.target,
        'time': 1000,
        'complete': function () {
        }
    });
}

// 回到上一个层级 
function backLevel() {
    app.level.back()
}

// 回到园区
function backCampus() {
     app.level.change(curCampus,{
        complete: () => {
        // 摄像机飞行到某位置
            app.camera.flyTo({
                'position': [31.80704080155094,62.565755435347675,107.89225522178951],
                'target': [-43.71565785445705,-2.045565506833676,-2.7759630232497297],
                'time': 2000,
                'complete': function() {
                }
            });
        }
    })
}

// 设置天空盒
function changeWeather(type) {
    console.log(type)
    if (type === '0') {
        $.get('./resource/skybox/api/35bc75a821837cfbfb8a4e79', function (result) {
            app.skyBox = JSON.parse(result);
        })
        cleanParticle()
    } else {
        $.get('./resource/skybox/api/8217708ecf215ec4e04a4ef6', function (result) {
            app.skyBox = JSON.parse(result);
        });
        createParticle()
    }
}

function addTestMarker () {
    const params = {
        type:null,
        list: [
            {
                id: 'FTL_B1F_XFSX',
                alarmId: '123',
                status: '0',
                type: '27'
            },
            {
                id: 'LZZX-DZWL-3',
                alarmId: '123',
                status: '3',
                type: '27'
            },
            {
                id: 'LZZX-SHANGHAILINGXIANG-16016317924114116-1',
                alarmId: '123',
                status: '0',
                type: '9'
            },
            
        ],
        building: [
            {
                id: 'Building_1',
                name: '1号楼',
                value: 10,
                alarmValue: 5
            },
             {
                id: 'Building_2',
                name: '2号楼',
                value: 0,
                alarmValue: 0
            }
        ]
    }
    addMarker(params)
}

function addRadarEffect() {
    const radar = app.query('#Radar_Ring_1')[0];
    radar.style.opacity = 1
    // $('.radarBox').css('display', 'block');
}

function removeRadarEffect() {
   const radar = app.query('#Radar_Ring_1')[0];
    radar.style.opacity = 0
    //$('.radarBox').css('display', 'none');
}

function createRadarMarker() {
    const obj = app.query(`#LZZX-WRJ-8b262ced-8f3d-6de7-97da-6a8fa3d9be6e`)[0]
    if (!obj) return
    const rsMarkerHtml =
    `<div  class="radarBox" style="position: absolute;" >
        <div class="picture"  style="height: 36px;width: 27px;cursor:pointer">
            <img src='./uploads/wechat/oLX7p01TFSqr8hXrrSZJGYVIpQIc/file/浙江省廉政教育基地/assets/1-1.png'
 style="height: 100%;width: 100%;">
         </div>
        <div id="radarBox" style="position: absolute;height: 40px;width: 40px;left:-85px;top:-85px;z-index:-1"></div>
    </div>
    </div>`;
    $('#div3d').append($(rsMarkerHtml));
        // 创建高亮标记
    const rsUiAnchor  = app.create({
        type: "UIAnchor",
        element: $(`.radarBox`)[0],
        localPosition: [0, 0, 0],
        parent: obj,
        pivotPixel: [15,30] // 当前用值是角标的中心点 
    })
    $('.radarBox').css('display', 'none');
    createCanvas()
}
// 创建圆形扩散效果
function createCanvas() {
    var canvasList = document.getElementById('radarBox');
    var canvas = document.createElement('canvas');
    canvasList.appendChild(canvas);
    canvas.width = 200;
    canvas.height = 200;
    var context = canvas.getContext("2d");
    var width = 200,
        height = 200;
    var arr = [];
    arr.push({
        x: parseInt(canvas.width / 2),
        y: parseInt(canvas.height / 2)
    });

    // 创建构造函数Circle
    function Circle(x, y, radius) {
        this.xx = x;  // 在画布内随机生成x值
        this.yy = y;
        this.radius = radius;
    };
    Circle.prototype.radiu = function() {
        radius += 2.5;  // 每一帧半径增加0.5
        if (this.radius > 95) {
            radius = 0;
        };
    };
    // 绘制圆形的方法
    Circle.prototype.paint = function() {
        context.beginPath();
        context.arc(this.xx, this.yy, this.radius, 0, Math.PI * 2);
        context.closePath();
        context.lineWidth = 2;  // 线条宽度
        context.strokeStyle = 'rgba(0, 204, 153,1)';  // 颜色
        context.stroke();
    };

    var newfun = null;
    var radius = 0;

    function createCircles() {
        for (var j = 0; j < arr.length; j++) {
            newfun = new Circle(arr[j].x, arr[j].y, radius);  //调用构造函数
            newfun.paint();
        };
        newfun.radiu();
    };

    // 创建临时canvas 
    var backCanvas = document.createElement('canvas'),
        backCtx = backCanvas.getContext('2d');
    backCanvas.width = width;
    backCanvas.height = height;
    // 设置主canvas的绘制透明度
    context.globalAlpha = 0.95;
    // 显示即将绘制的图像，忽略临时canvas中已存在的图像
    backCtx.globalCompositeOperation = 'copy';
    var render = function() {
        // 先将主canvas的图像缓存到临时canvas中
        backCtx.drawImage(canvas, 0, 0, width, height);
        // 清除主canvas上的图像
        context.clearRect(0, 0, width, height);
        // 在主canvas上画新圆
        createCircles();
        // 等新圆画完后，再把临时canvas的图像绘制回主canvas中
        context.drawImage(backCanvas, 0, 0, width, height);
    };
    // 刷新计时器
    setInterval(function() {
        render();
    }, 20);
}

// 降雨效果
function createParticle() {
    cleanParticle();
    // 创建粒子
    var particle = app.create({
        type: 'ParticleSystem',
        name: 'Rain',
        url: './models/18112113d4jcj4xcoyxecxehf3zodmvp/0/particles',
        position: [0, 300, 0],
        complete: function (ev) {
            ev.object.scale = [10, 10, 10];
        }
    });
    // 设置粒子最大密度
    particle.setGroupAttribute('maxParticleCount', 1000);
    // 设置粒子最小密度
    particle.setParticleAttribute('particleCount', 500);

}


// 清除降雨效果
function cleanParticle() {
    // 获取当前已创建的粒子
    var particle = app.query('.ParticleSystem');
    console.log(particle)
    // 判断当前有无创建的粒子
    if (particle) {
        // 存在，将已创建的粒子删除
        particle.destroy();
    }
}

//触发设备聚焦并点击
function clickDevice(data) {
    const buildingNum = data.buildingNum
    const deviceId = data.deviceId
 if (!buildingNum) {
        $(`#rs-marker-${deviceId}`).click()
 } else {
     const b = app.query('#Building_1')[0]
    app.camera.flyTo({
            object: b,
            time: 1000,
            complete: () => {
                app.level.change(b, {
                    complete: function () {
                        setTimeout(() => {
                            $(`#rs-marker-${deviceId}`).click()
                        },2000)
                    }
                }) 
            }
        })
    } 
}


function createRanderCar(carModels,paths,carOb) {
    const rander = Math.random()
    const randerPaths = paths[getRandomInteger(0,1)]
    const randerCar = carModels[getRandomInteger(0,4)]
    carOb[`car${rander}`] = app.create({
        type: 'Thing',
        name: `car${rander}`,
        url: randerCar,
        id: `car${rander}`,
        position: randerPaths[0], // 设置创建车辆模型时在的世界坐标位置
        angle: 0, // 车辆角度
        complete: function () {
            console.log(carOb)
            setTimeout(()=> {
                carOb[`car${rander}`].movePath({
                    orientToPath: true, // 对象移动时沿向路径方向
                    path: randerPaths, // 路径坐标点数组
                    time: 40 * 1000, // 路径总时间 毫秒
                    delayTime: 1000, // 延时 1s 执行
                    lerpType: null, // 插值类型（默认为线性插值）此处设置为不插值
                    complete: function() {
                        carOb[`car${rander}`].destroy()
                        delete carOb[`car${rander}`]
                    }
                });
            },500)
           
        }
    })
}

// 车模型运动效果
function addCarEvent() {

    const carModels = [
        './models/D12DF3998C9149D5A9B44652AB78BD99/0/gltf/',
        './models/87C0CB8B1053429A9F1EB56BD4D78E11/0/gltf/',
        './models/BCE46AC0C72A449BBE558D42A9FE14E1/0/gltf/',
        './models/32B229C6B4FF4BDA8691D6BDEAE58322/0/gltf/',
        './models/91FACB0F809240539A0143BC468A82ED/0/gltf/'
    ]
    const paths = [
        [[ -482.04, -0.08, 68.071],[ -311.093, -0.08, 45.607], [ -34.397, -0.08, 42.067],[ 40.488, -0.08, 40.114], [ 73.399, -0.08, 34.22], [ -119.235, -0.08, -513.142]],
        [[ -125.145, -0.08, -511.3],[ 65.874, -0.08, 24.484], [ 73.22, -0.08, 89.975], [ 80.711, -0.08, 472.087]],
    ]
    carTimer = setInterval(()=>{
        createRanderCar(carModels,paths,carOb)
    }, 2000)
    
}
// 移除车模型运动效果
function removeCarEvent() {
    clearInterval(carTimer)
    for (let key in carOb) {
        carOb[key].destroy()
        delete carOb[key]
    }
}