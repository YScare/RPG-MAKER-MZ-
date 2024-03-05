/*:
 * @target MZ
 * @url https://github.com/YScare/RPG-MAKER-MZ-plugin
 * @plugindesc 在战斗场景中显示图像UI。
 * @author 千影衣
 * 
 * @help 商用OK，无需署名
 * 将“PPTBACK.png”放入system。
 * 可以改变图片样式，但是不要改变图片名，图片尺寸不限。
 * 
 * @param battlex
 * @text 横坐标
 * @type number
 * @desc 图片显示的纵坐标
 *
 * @param battley
 * @text 纵坐标
 * @type number
 * @desc 图片显示的横坐标
 */

const pluginName = "battlepicture";
var parameters = PluginManager.parameters(pluginName);
var battlex = Number(parameters['battlex'] || 200);
var battley = Number(parameters['battley'] || 200); 
	
//==============================
// 读取图片
//==============================
ImageManager.loadbattleIcon = function(filename) {
	return this.loadBitmap('img/system/', filename, 0, true);
};	

//==============================
//创建Spriteset
//==============================
var _atbGauge_createSpriteset = Scene_Battle.prototype.createSpriteset;
Scene_Battle.prototype.createSpriteset = function() {
	_atbGauge_createSpriteset.call(this);
    if (BattleManager.isTpb()) {this.createbattleGauge()};
};

//==============================
// 创建Gauge
//==============================
Scene_Battle.prototype.createbattleGauge = function() {
	this._battlepicture = new BattlePicture()
	this._hudField.addChild(this._battlepicture);
};

//===============================
//Gauge
//===============================

function BattlePicture() {
    this.initialize.apply(this, arguments);
};

BattlePicture.prototype = Object.create(Sprite.prototype);
BattlePicture.prototype.constructor = BattlePicture;

//==============================
// 初始化
//==============================
BattlePicture.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
	this.createLayout();
};

//==============================
// 创建 Layout
//==============================
BattlePicture.prototype.createLayout = function() {
	this.x = battlex;
	this.y = battley;	
    this._layout = new Sprite(ImageManager.loadbattleIcon("PPTBACK"));
	this.addChild(this._layout);
};
