/*:
 *==============
 *@author 千影衣
 *@help 根据ChangeMaxUnitBattleParty插件反向编写，商用OK，免费，无需署名。
 *
 *==============
 * @target MZ
 * @plugindesc 战斗最大人数
 * @param maxnumber
 * @type number
 * @text 最大人数
 * 
 * @param isChangeUIScale
 * @type boolean
 * @text 对 UI 比例的更改
 * @default true
 * 
 * @param isDynamicUIScale
 * @type boolean
 * @text 动态 UI 缩放
 * @default true
 * 
 * @param characterNameFontSize
 * @type number
 * @text 字符字体大小
 * @min 0
 * @max 26
 * @default 0
*/
(function(){
    const pluginName = "battlenumber";
    var parameters = PluginManager.parameters(pluginName);
    var maxnumber = Number(parameters['maxnumber'] ||4);
    var isChangeUIScale = parameters['isChangeUIScale'] && parameters['isChangeUIScale'].toLowerCase() === 'true';
    var isDynamicUIScale = parameters['isDynamicUIScale'] && parameters['isDynamicUIScale'].toLowerCase() === 'true';
    var characterNameFontSize = Number(parameters['characterNameFontSize'] || 0);
    var scalingFactorByMaxnumber = maxnumber >= 4 ? 1.0 : maxnumber/4;
    function calcScalingFactorByCurrentUnit() {
        return $gameParty.battleMembers().length >= 4 ? 1.0 : $gameParty.battleMembers().length/4 ;
    }
    Game_Party.prototype.maxBattleMembers = function() {
        return maxnumber;
    };
    Window_BattleStatus.prototype.maxCols = function() {
        return isChangeUIScale ? (isDynamicUIScale ? $gameParty.battleMembers().length >= 4 ? 4 : $gameParty.battleMembers().length : maxnumber) : 4;
    };
    Sprite_Gauge.prototype.bitmapWidth = function() {
        return 128 * (isChangeUIScale && $gameParty.inBattle() ? (isDynamicUIScale ? calcScalingFactorByCurrentUnit() : scalingFactorByMaxnumber) : 1.0);
    };
    let _Sprite_Name_prototype_initMembers = Sprite_Name.prototype.initMembers;
    Sprite_Name.prototype.initMembers = function() {
        _Sprite_Name_prototype_initMembers.call(this);
        this._isInBattle = $gameParty.inBattle();
    };
    Sprite_Name.prototype.bitmapWidth = function() {
        return 128 * (isChangeUIScale && $gameParty.inBattle() ? (isDynamicUIScale ? calcScalingFactorByCurrentUnit() : scalingFactorByMaxnumber) : 1.0);
    };
   
    Sprite_Name.prototype.updateBitmap = function() {
        const name = this.name();
        const color = this.textColor();
        const isBattle = $gameParty.inBattle();
        if (name !== this._name || color !== this._textColor || isBattle !== this._isInBattle) {
            this._name = name;
            this._textColor = color;
            this._isInBattle = isBattle;
            this.redraw();
        }
    };
    Sprite_Name.prototype.fontSize = function() {
        if ($gameParty.inBattle() && isChangeUIScale && characterNameFontSize > 1) {
            return characterNameFontSize;
        }
        else {
            return $gameSystem.mainFontSize();
        }
    };
    Sprite_Gauge.prototype.labelFontSize = function() {
        return ($gameSystem.mainFontSize() - 2) * (isChangeUIScale && $gameParty.inBattle() ? (isDynamicUIScale ? calcScalingFactorByCurrentUnit() : scalingFactorByMaxnumber) : 1.0);
    };


})();