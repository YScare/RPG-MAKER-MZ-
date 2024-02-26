/*:
 * 
 *
 * @author 千影衣
 * @target MZ
 * @plugindesc 自定义鼠标指针
 * @help 图片素材放入system文件，建议32像素以下，太大容易判定错误。
 * 这个插件是根据图片素材名索引图像的，所以不要修改素材名与格式。
 * 可商用，免费，无需署名
 * @param DIYmouse
 * 
 * 
 * 
 */
(function(){
    const pluginName = "DIYmouse";
    document.body.style.cursor = 'url("../img/system/DIYmouse.png"), auto';
})();