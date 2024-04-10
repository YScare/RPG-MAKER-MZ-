/*:
 *==============
 *@author 千影衣
 *@help 商用OK，免费，无需署名。
 *@url https://github.com/YScare/RPG-MAKER-MZ-plugin
 *==============
 *@target MZ
 *
 *@plugindesc 角色属性与tp槽隐藏
 * 
 *@param isattack
 *@type boolean
 *@text 是否显示物攻相关属性
 *@default true
 *
 *@param ismagic
 *@type boolean
 *@text 是否显示魔法相关属性
 *@default true
 *
 *@param isspeed
 *@type boolean
 *@text 是否显示速度属性
 *@default true
 *
 *@param isluck
 *@type boolean
 *@text 是否显示幸运属性
 *@default true
 *
 *@param istp
 *@type boolean
 *@text 是否隐藏角色菜单中tp条的显示
 *@default true
 * 
 */
(function(){
    const pluginName = "yingcangshuxing";
    var parameters = PluginManager.parameters(pluginName);
    var isattack = parameters['isattack'] && parameters['isattack'].toLowerCase() === 'true';
    var ismagic = parameters['ismagic'] && parameters['ismagic'].toLowerCase() === 'true';
    var isspeed = parameters['isspeed'] && parameters['isspeed'].toLowerCase() === 'true';
    var isluck = parameters['isluck'] && parameters['isluck'].toLowerCase() === 'true';
    var istp = parameters['istp'] && parameters['istp'].toLowerCase() === 'true';
    Window_StatusParams.prototype.drawItem = function(index) {
        const rect = this.itemLineRect(index);
        const paramId = index + 2;
        if(isattack){
            if(paramId===2||paramId===3){
                const name = TextManager.param(paramId);
                const value = this._actor.param(paramId);
                this.changeTextColor(ColorManager.systemColor());
                this.drawText(name, rect.x, rect.y, 160);
                this.resetTextColor();
                this.drawText(value, rect.x + 160, rect.y, 60, "right");
            }
        }

        if (ismagic){
            if(paramId===4||paramId===5){
                const name = TextManager.param(paramId);
                const value = this._actor.param(paramId);
                this.changeTextColor(ColorManager.systemColor());
                this.drawText(name, rect.x, rect.y, 160);
                this.resetTextColor();
                this.drawText(value, rect.x + 160, rect.y, 60, "right");
            }
        }

        if(isspeed){
            if(paramId===6){
                const name = TextManager.param(paramId);
                const value = this._actor.param(paramId);
                this.changeTextColor(ColorManager.systemColor());
                this.drawText(name, rect.x, rect.y, 160);
                this.resetTextColor();
                this.drawText(value, rect.x + 160, rect.y, 60, "right");
            }
        }

        if (isluck){
            if(paramId===7){
                const name = TextManager.param(paramId);
                const value = this._actor.param(paramId);
                this.changeTextColor(ColorManager.systemColor());
                this.drawText(name, rect.x, rect.y, 160);
                this.resetTextColor();
                this.drawText(value, rect.x + 160, rect.y, 60, "right");
            }

        }
    };

    if(istp){
        Window_StatusBase.prototype.placeBasicGauges = function(actor, x, y) {
            this.placeGauge(actor, "hp", x, y);
            this.placeGauge(actor, "mp", x, y + this.gaugeLineHeight());
        };
    }

    
})();
