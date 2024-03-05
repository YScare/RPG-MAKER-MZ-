/*:
 *======================
 *
 *======================
 * @author 千影衣
 * @url https://github.com/YScare/RPG-MAKER-MZ-plugin
 * @target MZ
 * @plugindesc 战斗动画帧数
 * @help 插件没有改变战斗图片素材的行数，只是增加了每一行对应动作区域的帧数。商用OK，免费，无需署名
 * @param battlecarton
 * @type number
 * @text 帧数
 * 
 * 
 */
(function(){
    const pluginName = "BattleCarton";
    var parameters = PluginManager.parameters(pluginName);
    var battlecarton = Number(parameters['battlecarton']);
    Sprite_Actor.prototype.updateFrame = function() {
    Sprite_Battler.prototype.updateFrame.call(this);
    const bitmap = this._mainSprite.bitmap;
    if (bitmap) {
        const motionIndex = this._motion ? this._motion.index : 0;
        const pattern = this._pattern < battlecarton ? this._pattern : 1;
        const cw = bitmap.width / (battlecarton*3);
        const ch = bitmap.height / 6;
        const cx = Math.floor(motionIndex / 6) * 3 + pattern;
        const cy = motionIndex % 6;
        this._mainSprite.setFrame(cx * cw, cy * ch, cw, ch);
        this.setFrame(0, 0, cw, ch);
    }
};
})();
