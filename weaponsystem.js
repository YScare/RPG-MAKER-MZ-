/*:
@target MZ
@plugindesc 战斗时装备扩展、隐藏与更换，主要是整合和完善了一些插件的功能。
@author 千影衣
@help 
=========================
装备槽扩展说明；
只是将原来的槽位进行了复制，由于rm只指定了一个武器槽，所以并不能实现多个类型
武器的装备。主要用来实现角色可装备物品的区别特性。

使用方法；在角色的备注中写上<weaponsystem:1.1.2.3.4.5>
                          数字对应装备类型的ID号，可以根据自己的需要增加或减少。
                          如果你的装备类型中有6号类型，但是没有写在角色备注中，
                          那么六号装备槽会被隐藏。
=========================

@param commandName
@text 指令“更换武器”的名称
@desc Displaying command name that changes equipments.
@type string
@default 装备

@param weaponxy
@text 指令位置
@desc 将“更改装备”指令移动到命令栏指定位置
(0:Top 1:Bottom)
@type select
@option 上
@value 0
@option 下
@value 1
@default 0

@param weaponchange
@type boolean
@default true
@text 启用更换装备
@on 开启
@off 关闭
@desc 是否开启武器更换功能

@param weaponslot
@type boolean
@default true
@text 启用装备槽扩展与隐藏
@on 开启
@off 关闭
@desc 是否开启装备槽扩展与隐藏
*/

(() => {
    const pluginName = 'weaponsystem';
    const parameters = PluginManager.parameters(pluginName);
    const commandName = parameters['commandName'] || '装备';
    const doesConsumeTurn = !!eval(parameters['doesConsumeTurn']);
    const weaponchange = (parameters['weaponchange'] === "true");
    const weaponslot = (parameters['weaponslot'] === "true");
    const weaponxy = Number(parameters['weaponxy'] || 0);

    /*
    ==========================================
    更换装备功能
    ==========================================
    */

    if(weaponchange){
      
    // 战斗槽

    function Window_BattleEquipSlot() {
      this.initialize.apply(this, arguments);
    }
  
    Window_BattleEquipSlot.prototype = Object.create(Window_EquipSlot.prototype);
    Window_BattleEquipSlot.prototype.constructor = Window_BattleEquipSlot;
  
    Window_BattleEquipSlot.prototype.show = function() {
      Window_EquipSlot.prototype.show.call(this);
      this.showHelpWindow();
    };
  
    Window_BattleEquipSlot.prototype.hide = function() {
      Window_EquipSlot.prototype.hide.call(this);
      this.hideHelpWindow();
    };

    // 命令检查窗口

    const _Scene_Battle_isAnyInputWindowActive =
     Scene_Battle.prototype.isAnyInputWindowActive;
    Scene_Battle.prototype.isAnyInputWindowActive = function() {
      if(_Scene_Battle_isAnyInputWindowActive.call(this)) {
        return true;
      }
      return this._equipSlotWindow.active || this._equipItemWindow.active;
    };

    //创建武器装备界面

    const _Scene_Battle_createAllWindows =
      Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
      _Scene_Battle_createAllWindows.call(this);
      this.createEquipStatusWindow();
      this.createEquipSlotWindow();
      this.createEquipItemWindow();
    };
  
    Scene_Battle.prototype.createEquipStatusWindow = function() {
      const rect = this.equipStatusWindowRect();
      this._equipStatusWindow = new Window_EquipStatus(rect);
      this._equipStatusWindow.hide();
      this.addWindow(this._equipStatusWindow);
    };
  
    Scene_Battle.prototype.equipStatusWindowRect = function() {
      const wx = 0;
      const wy = this.buttonAreaBottom();
      const ww = Scene_Equip.prototype.statusWidth.call(this);
      const wh = Scene_Equip.prototype.mainAreaHeight.call(this);
      return new Rectangle(wx, wy, ww, wh);
    };
  
    Scene_Battle.prototype.createEquipSlotWindow = function() {
      const rect = this.equipSlotAndItemWindowRect();
      this._equipSlotWindow = new Window_BattleEquipSlot(rect);
      this._equipSlotWindow.setHelpWindow(this._helpWindow);
      this._equipSlotWindow.setStatusWindow(this._equipStatusWindow);
      this._equipSlotWindow.setHandler('ok', this.onEquipSlotOk.bind(this));
      this._equipSlotWindow.setHandler('cancel',
        this.onEquipSlotCancel.bind(this)
      );
      this._equipSlotWindow.hide();
      this.addWindow(this._equipSlotWindow);
    };
  
    Scene_Battle.prototype.createEquipItemWindow = function() {
      const rect = this.equipSlotAndItemWindowRect();
      this._equipItemWindow = new Window_EquipItem(rect);
      this._equipItemWindow.setHelpWindow(this._helpWindow);
      this._equipItemWindow.setStatusWindow(this._equipStatusWindow);
      this._equipItemWindow.setHandler('ok', this.onEquipItemOk.bind(this));
      this._equipItemWindow.setHandler('cancel',
        this.onEquipItemCancel.bind(this)
      );
      this._equipSlotWindow.setItemWindow(this._equipItemWindow);
      this._equipItemWindow.hide();
      this.addWindow(this._equipItemWindow);
    };
  
    Scene_Battle.prototype.equipSlotAndItemWindowRect = function() {
      const wx = this._equipStatusWindow.width;
      const wy = this._equipStatusWindow.y;
      const ww = Graphics.boxWidth - wx;
      const wh = this._equipStatusWindow.height;
      return new Rectangle(wx, wy, ww, wh);
    };
  
    //将命令增加到角色命令窗口
   
    const _Scene_Battle_createActorCommandWindow =
     Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
      _Scene_Battle_createActorCommandWindow.call(this);
      this._actorCommandWindow.setHandler('equip', this.commandEquip.bind(this));
    };
  
    const _Window_ActorCommand_makeCommandList =
     Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
      if (this._actor && weaponxy === 0) {
        this.addEquipCommand();
      }
      _Window_ActorCommand_makeCommandList.call(this);
      if (this._actor && weaponxy === 1) {
        this.addEquipCommand();
      }
    };
  
    Window_ActorCommand.prototype.addEquipCommand = function() {
      if (this._actor && !this._actor.actor().meta.noEquipChange) {
        this.addCommand(commandName, 'equip');
      }
    };

    const usingEquipState = () => "updateEquipStates" in Game_Actor.prototype;
  
    if (usingEquipState()) {
      const _Game_Actor_updateEquipStates =
        Game_Actor.prototype.updateEquipStates;
      Game_Actor.prototype.updateEquipStates = function(addableState = true) {
        $gameTemp.updateEquipStatus = true;
        _Game_Actor_updateEquipStates.call(this, addableState);
        $gameTemp.updateEquipStatus = null;
      };
  
      const _pushAddedState = Game_ActionResult.prototype.pushAddedState;
      Game_ActionResult.prototype.pushAddedState = function(stateId) {
        if ($gameTemp.updateEquipStatus) {
          return;
        }
        _pushAddedState.call(this, stateId);
      };
      const isAnyEquipWindowVisible = () => {
        const scene = SceneManager._scene; // 战斗场景窗口
        return scene._equipSlotWindow.visible || scene._equipItemWindow.visible;
      };
  
      const _updateEquipStates = Game_Actor.prototype.updateEquipStates;
  
      Game_Actor.prototype.updateEquipStates = function(addableState = true) {
      //在战斗中更换装备时，不应该调用函数。
        if (!$gameParty.inBattle() || !isAnyEquipWindowVisible()) {
          _updateEquipStates.call(this, addableState);
        }
      };
  
      // 当装备窗口刚刚关闭时更新。
      Game_Actor.prototype.updateEquipStates2 = function(addableState = true) {
        _updateEquipStates.call(this, addableState);
      };
    }
    // 强制刷新，因为一个人可能会受到buff/debuff的影响
    Scene_Battle.prototype.forceSetActor = function(actor) {
      if (this.equippingActor == null) {
        this._equipStatusWindow.forceSetActor(actor);
        this.equippingActor = actor;
      }
    };
  
    Window_EquipStatus.prototype.forceSetActor = function(actor) {
      this._actor = actor;
      this.refresh();
    };
  
    const _BattleManager_invokeAction = BattleManager.invokeAction;
    BattleManager.invokeAction = function(subject, target) {
      _BattleManager_invokeAction.call(this, subject, target);
      if (target === BattleManager.actor()) {
        SceneManager._scene.forceSetActor(target);
      }
    };

    // 回合结束时记住当前装备
    const needsStoreEquipInfo = () => !BattleManager.isTpb() && doesConsumeTurn;
  
    const storeCurrentEquips = () => {
      if (needsStoreEquipInfo()) {
        const actor = BattleManager.actor();
        if (actor && !actor._beforeEquips) { 
          actor._beforeEquips = JsonEx.makeDeepCopy(actor._equips);
          actor._partyWeapons = JsonEx.makeDeepCopy($gameParty._weapons);
          actor._partyArmors = JsonEx.makeDeepCopy($gameParty._armors);
        }
      }
    };
  
    const resumeCurrentEquips = actor => {
      if (needsStoreEquipInfo()) {
        if (actor && actor._beforeEquips) {
          actor._equips = JsonEx.makeDeepCopy(actor._beforeEquips);
          $gameParty._weapons = JsonEx.makeDeepCopy(actor._partyWeapons);
          $gameParty._armors = JsonEx.makeDeepCopy(actor._partyArmors);
          if (usingEquipState()) {
            actor.updateEquipStates();
          }
        }
      }
    };
  
    const _BattleManager_startActorInput = BattleManager.startActorInput;
    BattleManager.startActorInput = function() {
      resumeCurrentEquips(this._currentActor);
      _BattleManager_startActorInput.call(this);
    };
  
    const discardEquipsInfo = () => {
      if (needsStoreEquipInfo()) {
        for (const actor of $gameParty.members()) {
          if (actor._beforeEquips) { 
            actor._beforeEquips = null;
            actor._partyWeapons = null;
            actor._partyArmors = null;
          }
        }
      }
    };
  
    const _BattleManager_startTurn = BattleManager.startTurn;
    BattleManager.startTurn= function() {
      discardEquipsInfo();
      _BattleManager_startTurn.call(this);
    };
    Scene_Battle.prototype.refreshActor = function() {
      const actor = BattleManager.actor();
      this._equipStatusWindow.forceSetActor(actor);
      this._equipSlotWindow.setActor(actor);
      this._equipItemWindow.setActor(actor);
    };
  
    Scene_Battle.prototype.commandEquip = function() {
      this.refreshActor();
      storeCurrentEquips();
      this._equipStatusWindow.show();
      this._equipSlotWindow.refresh();
      this._equipSlotWindow.select(0);
      this._equipSlotWindow.show();
      this._equipSlotWindow.activate();
      this.equippingActor = null;
    };
  
    Scene_Battle.prototype.onEquipSlotOk = function() {
      this._equipSlotWindow.hide();
      //需要在战斗中刷新，否则装备列表不会被修改。
      this._equipItemWindow.refresh();
      this._equipItemWindow.select(0);
      this._equipItemWindow.show();
      this._helpWindow.show();
      this._actorCommandWindow.selectLast();
      this._equipItemWindow.activate();
    };
  
    const doesDisableToInput = () => {
      
      return !BattleManager.isTpb() && BattleManager.needsActorInputCancel();
    };
  
    Scene_Battle.prototype.onEquipSlotCancel = function() {
      if (usingEquipState()) {
        const actor = BattleManager.actor();
        if (actor) {
          BattleManager.actor().updateEquipStates2();
        }
      }
      if (doesConsumeTurn && !doesDisableToInput()) {
        this.selectNextCommand();
      }
      this._equipStatusWindow.hide();
      this._equipSlotWindow.hide();
      if (doesDisableToInput()) {
        BattleManager.actor().clearActions();
        BattleManager.selectNextActor(true);
      } else {
        this._actorCommandWindow.selectLast();
      }
      this._actorCommandWindow.activate();
      this.equippingActor = null;
    };
  
    Scene_Battle.prototype.onEquipItemOk = function() {
      SoundManager.playEquip();
      this.executeEquipChange();
      this.hideEquipItemWindow();
      this._equipSlotWindow.refresh();
      this._equipItemWindow.refresh();
      this._equipStatusWindow.refresh();
    };
  
    Scene_Battle.prototype.onEquipItemCancel = function() {
      this.hideEquipItemWindow();
    };
  
    Scene_Battle.prototype.executeEquipChange = function() {
      const actor = BattleManager.actor();
      const slotId = this._equipSlotWindow.index();
      const item = this._equipItemWindow.item();
      actor.changeEquip(slotId, item);
      //更换装备时，技能类型也发生变化。
      this._actorCommandWindow.refresh();
    };
  
    Scene_Battle.prototype.hideEquipItemWindow = function() {
      this._equipSlotWindow.show();
      this._equipSlotWindow.activate();
      this._equipItemWindow.hide();
      this._equipItemWindow.deselect();
    };

    // 当一个人更换武器或盔甲时，刷新所有装备窗口

    Scene_Battle.prototype.refreshAllWindows = function() {
      this._equipSlotWindow.refresh();
      this._equipItemWindow.refresh();
      this._equipStatusWindow.refresh();
    };
  
    const refreshEquipWindows = () => {
      if ($gameParty.inBattle()) {
        const scene = SceneManager._scene;
        if (scene === Scene_Battle) {
          scene.refreshAllWindows();
        }
      }
    };
  
    //更换武器
    const _Game_Interpreter_command127 = Game_Interpreter.prototype.command127;
    Game_Interpreter.prototype.command127 = function(params) {
      const result = _Game_Interpreter_command127.call(this, params);
      refreshEquipWindows();
      return result;
    };
  
    //更换防具
    const _Game_Interpreter_command128 = Game_Interpreter.prototype.command128;
    Game_Interpreter.prototype.command128 = function(params) {
      const result = _Game_Interpreter_command128.call(this, params);
      refreshEquipWindows();
      return result;
    };

    const _Window_EquipItem_maxCols = Window_EquipItem.prototype.maxCols;
    Window_EquipItem.prototype.maxCols = function() {
      if ($gameParty.inBattle()) {
        return 1;
      } else {
        return _Window_EquipItem_maxCols.call(this);
      }
    };


  
    const _Window_EquipItem_drawItem = Window_EquipItem.prototype.drawItem;
    Window_EquipItem.prototype.drawItem = function(index) {
      if ($gameParty.inBattle()) {
          Window_ItemList.prototype.drawItem.call(this, index);
      } else {
        _Window_EquipItem_drawItem.call(this, index);
      }
    };
  
    const _Window_EquipItem_makeItemList =
      Window_EquipItem.prototype.makeItemList;
    Window_EquipItem.prototype.makeItemList = function() {
      if ($gameParty.inBattle()) {
        Window_ItemList.prototype.makeItemList.call(this);
      } else {
        _Window_EquipItem_makeItemList.call(this);
      }
    };
    }
/*
 *==================================================
 *装备槽扩展
 *==================================================
 */
    if(weaponslot){
      const weaponslots = Game_Actor.prototype.equipSlots;
    Game_Actor.prototype.equipSlots = function() {
        const weaponsystem = this.actor().meta.weaponsystem;
        if (weaponsystem) {
            const slots = weaponsystem.split('.').map(Number);
            if (slots.length >= 2 && this.isDualWield()) slots[1] = 1;
            return slots;
        } else {
            return weaponslots.call(this);
        }
    };
    }
    
  
  })();
  
