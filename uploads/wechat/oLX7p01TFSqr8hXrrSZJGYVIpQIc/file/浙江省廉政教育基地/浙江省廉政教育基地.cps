/*
* 说明：本文件是用于“项目离线部署包”中引用资源的打包配置文件。
* 提示：打包项目离线部署包时，系统将参考本文件配置进行操作。为确保打包的完整性，请按照
*      指示填写项目中引入的资源URL。
*/
{
    // 当前项目使用的ThingJS包（thing.min.js）的版本号。
    "thingjs_version" : "1.4.35",
    /*
    * 资源配置示例：以场景资源为例,若项目中引用两个场景URL，分别为 "/api/scene/d370cad09e74f42d932b083d"，
    *             "/api/scene/b422fd26d4c7874df3992068"，为能正确打包上述两个场景，
    *             需配置如下信息：
    *             "scenes": [
    *                   "/api/scene/d370cad09e74f42d932b083d",
    *                   "/api/scene/b422fd26d4c7874df3992068"
    *             ]
    * 以下为目前支持的资源类型，请根据项目中各类资源实际引用情况进行填写
    */
    
    // 1.模型资源
    "models": [
        "/api/models/D12DF3998C9149D5A9B44652AB78BD99/0/gltf/",
        "/api/models/87C0CB8B1053429A9F1EB56BD4D78E11/0/gltf/",
        "/api/models/BCE46AC0C72A449BBE558D42A9FE14E1/0/gltf/",
        "/api/models/32B229C6B4FF4BDA8691D6BDEAE58322/0/gltf/",
        "/api/models/91FACB0F809240539A0143BC468A82ED/0/gltf/"
    ], 
    // 2.场景资源
    "scenes": [
        "/api/scene/2de6844b02bcca119b099386"
    ], 
    // 3.地图资源
    "maps": [],
    // 4.大屏资源-森大屏
    "senDshs": [], 
    // 5.大屏资源-标准版
    "charts": [], 
    // 6.拓扑资源
    "topologies": [], 
    // 7.效果资源
    "effect_templates": [], 
    // 8.图表资源
    "senCharts": [],
    // 9.天空盒资源
    "skyboxes": [
        "/api/skybox/35bc75a821837cfbfb8a4e79",
        "/api/skybox/8217708ecf215ec4e04a4ef6"
    ], 
    // 10.标记资源
    "attachments": [], 
    // 11.贴图资源
    "textures": [],
    // 12.音乐资源
    "musics": [] 
    // 此外，如引入预览脚本，需填写预览脚本版本号
    // "preview_version": "0.1.9"
}