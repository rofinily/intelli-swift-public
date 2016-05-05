BI.AnalysisETLOperatorCenterController = BI.inherit(BI.MVCController, {

    _construct : function (widget, model) {
        BI.AnalysisETLOperatorCenterController.superclass._construct.apply(this, arguments);
        this._editing = false;
        this.previewOperator = this.options.previewOperator;
    },



    _defaultConfig: function() {
        return BI.extend(BI.Controller.superclass._defaultConfig.apply(this, arguments), {

        })
    },

    clearOperator : function (widget){
        this.hideOperatorPane(widget)
        this._getTitle(widget).setEnable(true)
        this._getTitle(widget).clearAllSelected();
        this._getTitle(widget).setSaveButtonEnabled(true)
    },

    doNewSave :function (widget){
        var showingCard = this._getOperatorPane(widget).getContentWidget().getShowingCard();
        this.changeEditState(false, widget)
        this.clearOperator(widget)
        widget.fireEvent(BI.Controller.EVENT_CHANGE, this._editing, showingCard.update());
    },

    doSave : function(widget){
        var showingCard = this._getOperatorEditPane(widget).getContentWidget();
        this.changeEditState(false, widget);
        widget.fireEvent(BI.TopPointerSavePane.EVENT_SAVE, showingCard.update());
    },

    showOperatorPane : function(v, widget, model){
        this._statusAdd = true;
        this._getOperatorCard(widget).showCardByName(v.getValue())
        widget.operatorPaneItem.height = widget._constant.operatorPaneHeight;
        widget.operatorEditPaneItem.height = 0;
        this._getLayout(widget).resize(widget.vtapeItem)
        this._getOperatorEditPane(widget).hide();
        this._getOperatorPane(widget).show(this._getPosFromElement(v, widget))
        var showingCard = this._getOperatorPane(widget).getContentWidget().getShowingCard();
        //新建
        if(BI.isFunction(showingCard.populate)){
            showingCard.populate({parents : [model.update()]});
        }
        this._getOperatorPane(widget).setEditing(true)
        this._getTitle(widget).setSaveButtonEnabled(false)
    },


    hideOperatorPane : function (widget) {
        this._statusAdd = false;
        widget.operatorPaneItem.height = 0;
        if(this.options.showContent === true) {
            widget.operatorEditPaneItem.height = widget._constant.operatorPaneHeight;
        }
        this._getLayout(widget).resize(this.vtapeItem)
        if(this.options.showContent === true) {
            this._getOperatorEditPane(widget).show(this._getPosFromValue(widget));
            this._getOperatorEditPane(widget).setEditing(false);
        } else {
            this._getOperatorEditPane(widget).hide()
        }
        this._getOperatorPane(widget).hide();
    },

    _getPosFromValue : function (widget) {
        var value = widget.options.contentItem.value.value
        var v = widget.title.getElementByValue(value);
        //不存在就不指向
        if(v === null) {
            return -999;
        }
        return this._getPosFromElement(v, widget);
    },

    _getPosFromElement : function(v, widget) {
        var buttonPos = v.element.position().left;
        var buttonWith = v.element.outerWidth();
        return buttonPos + buttonWith/2 - widget._constant.pointerWidth/2 + widget._constant.padding;
    },

    changeEditState : function (editing, widget) {
        this._editing = editing;
        this._getTitle(widget).setEnable(!this._editing)
    },

    setEnable : function(v, widget) {
        //编辑状态是不允许调整他的状态的
        if(this._editing === true){
            return;
        }
        this._getTitle(widget).clearAllSelected();
        this._getTitle(widget).setEnable(v)
        this._getOperatorEditPane(widget).setEnable(v)
        this._getOperatorPane(widget).setEnable(v)
        this.hideOperatorPane(widget);
    },

    _getTitle : function(widget) {
        return widget.title;
    },

    _getLayout : function(widget) {
        return widget.vtape
    },

    _getOperatorCard : function(widget) {
        return widget.operatorCard
    },

    _getOperatorPane : function (widget){
        return widget.operatorPane;
    },

    _getOperatorEditPane : function (widget) {
        return widget.operatorEditPane;
    },

    _getPreviewTable : function (widget) {
        return widget.previewTable;
    },

    filterChange : function (filter, widget){
        var showingCard = this._statusAdd ? this._getOperatorPane(widget).getContentWidget().getShowingCard() : this._getOperatorEditPane(widget).getContentWidget();
        showingCard.controller.filterChange(filter);
    },

    getFilterValue : function (field, widget){
        var showingCard = this._statusAdd ? this._getOperatorPane(widget).getContentWidget().getShowingCard() : this._getOperatorEditPane(widget).getContentWidget();
        return showingCard.controller.getFilterValue(field);
    },

    refreshPreviewData : function (v, widget) {
        this.setPreviewOperator(v);
        var args = BI.clone(this.currentData);
        if(BI.isNull(args)) {
            args = []
            args.push([]);
            args.push([])
        }
        args.push(widget);
        args.push({});
        this.populatePreviewData.apply(this, args)
    },

     setPreviewOperator : function(operator) {
        this.previewOperator = operator;
    },

    populatePreviewData : function () {
        var widget = arguments[arguments.length - 2]
        var args = Array.prototype.slice.call(arguments, 0, arguments.length - 2);
        this.currentData = BI.clone(args);
        args.push(this.previewOperator)
        this._getPreviewTable(widget).populate.apply(this._getPreviewTable(widget), args)
    },

    fieldValuesCreator : function (field, callback, widget, model) {
        return BI.ETLReq.reqFieldValues({
            table : model.update(),
            field : field
        }, callback);
    },
    
    populate : function (widget, model) {
        if(this.options.showContent === true) {
            widget.operatorEditPane.getContentWidget().populate(model.update(), this.options);
        }
    },

    deferChange : function (widget, model) {
        this.hideOperatorPane(widget);
    }

})