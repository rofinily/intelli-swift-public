/**
 * @class BI.ScatterChartSetting
 * @extends BI.Widget
 * 柱状，堆积柱状，组合图样式
 */
BI.ScatterChartSetting = BI.inherit(BI.Widget, {

    constant: {
        SINGLE_LINE_HEIGHT: 58,
        SIMPLE_H_GAP: 10,
        SIMPLE_L_GAP: 2,
        SIMPLE_H_LGAP: 5,
        CHECKBOX_WIDTH: 16,
        EDITOR_WIDTH: 80,
        EDITOR_HEIGHT: 26,
        BUTTON_WIDTH: 40,
        BUTTON_HEIGHT: 30,
        ICON_WIDTH: 24,
        ICON_HEIGHT: 24,
        NUMBER_LEVEL_SEGMENT_WIDTH: 300,
        FORMAT_SEGMENT_WIDTH: 240,
        LEGEND_SEGMENT_WIDTH: 180
    },

    _defaultConfig: function(){
        return BI.extend(BI.ScatterChartSetting.superclass._defaultConfig.apply(this, arguments), {
            baseCls: "bi-charts-setting"
        })
    },

    _init: function(){
        BI.ScatterChartSetting.superclass._init.apply(this, arguments);
        var self = this, o = this.options;

        this.colorSelect = BI.createWidget({
            type: "bi.chart_setting_select_color_combo",
            width: 130
        });
        this.colorSelect.populate();

        this.colorSelect.on(BI.ChartSettingSelectColorCombo.EVENT_CHANGE, function(){
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        var tableStyle = BI.createWidget({
            type: "bi.horizontal_adapt",
            columnSize: [100],
            cls: "single-line-settings",
            items: [{
                type: "bi.label",
                text: BI.i18nText("BI-Table_Sheet_Style"),
                textAlign: "left",
                lgap: this.constant.SIMPLE_H_LGAP,
                cls: "line-title"
            }, {
                type: "bi.left",
                cls: "detail-style",
                items: BI.createItems([{
                    type: "bi.label",
                    text: BI.i18nText("BI-Chart_Color"),
                    cls: "attr-names"
                }, {
                    el: {
                        type: "bi.center_adapt",
                        items: [this.colorSelect]
                    },
                    lgap: this.constant.SIMPLE_H_GAP
                }], {
                    height: this.constant.SINGLE_LINE_HEIGHT
                })
            }]
        });

        //格式和数量级
        this.lYAxisStyle = BI.createWidget({
            type: "bi.segment",
            width: this.constant.FORMAT_SEGMENT_WIDTH,
            height: this.constant.BUTTON_HEIGHT,
            items: BICst.TARGET_STYLE_FORMAT
        });

        this.lYAxisStyle.on(BI.Segment.EVENT_CHANGE, function(){
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        this.numberLevellY = BI.createWidget({
            type: "bi.segment",
            width: this.constant.NUMBER_LEVEL_SEGMENT_WIDTH,
            height: this.constant.BUTTON_HEIGHT,
            items: BICst.TARGET_STYLE_LEVEL
        });

        this.numberLevellY.on(BI.Segment.EVENT_CHANGE, function(){
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        this.XAxisStyle = BI.createWidget({
            type: "bi.segment",
            width: this.constant.FORMAT_SEGMENT_WIDTH,
            height: this.constant.BUTTON_HEIGHT,
            items: BICst.TARGET_STYLE_FORMAT
        });

        this.XAxisStyle.on(BI.Segment.EVENT_CHANGE, function(){
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        this.numberLevelX = BI.createWidget({
            type: "bi.segment",
            width: this.constant.NUMBER_LEVEL_SEGMENT_WIDTH,
            height: this.constant.BUTTON_HEIGHT,
            items: BICst.TARGET_STYLE_LEVEL
        });

        this.numberLevelX.on(BI.Segment.EVENT_CHANGE, function(){
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        //单位
        this.LYUnit = BI.createWidget({
            type: "bi.sign_editor",
            width: this.constant.EDITOR_WIDTH,
            height: this.constant.EDITOR_HEIGHT,
            cls: "unit-input",
            watermark: BI.i18nText("BI-Custom_Input")
        });

        this.LYUnit.on(BI.SignEditor.EVENT_CONFIRM, function(){
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        this.XUnit = BI.createWidget({
            type: "bi.sign_editor",
            width: this.constant.EDITOR_WIDTH,
            height: this.constant.EDITOR_HEIGHT,
            cls: "unit-input",
            watermark: BI.i18nText("BI-Custom_Input")
        });

        this.XUnit.on(BI.SignEditor.EVENT_CONFIRM, function(){
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        //显示标题
        this.isShowTitleLY = BI.createWidget({
            type: "bi.multi_select_item",
            value: BI.i18nText("BI-Show_Title"),
            width: 90
        });

        this.isShowTitleLY.on(BI.Controller.EVENT_CHANGE, function(){
            this.isSelected() ? self.editTitleLY.setVisible(true) : self.editTitleLY.setVisible(false);
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        this.editTitleLY = BI.createWidget({
            type: "bi.sign_editor",
            width: this.constant.EDITOR_WIDTH,
            height: this.constant.EDITOR_HEIGHT,
            cls: "unit-input"
        });
        this.editTitleLY.on(BI.SignEditor.EVENT_CONFIRM, function(){
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        this.isShowTitleX = BI.createWidget({
            type: "bi.multi_select_item",
            value: BI.i18nText("BI-Show_Title"),
            width: 90
        });

        this.isShowTitleX.on(BI.Controller.EVENT_CHANGE, function(){
            this.isSelected() ? self.editTitleX.setVisible(true) : self.editTitleX.setVisible(false);
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        this.editTitleX = BI.createWidget({
            type: "bi.sign_editor",
            width: this.constant.EDITOR_WIDTH,
            height: this.constant.EDITOR_HEIGHT,
            cls: "unit-input"
        });

        this.editTitleX.on(BI.SignEditor.EVENT_CONFIRM, function(){
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        //图例
        this.legend = BI.createWidget({
            type: "bi.segment",
            width: this.constant.LEGEND_SEGMENT_WIDTH,
            height: this.constant.BUTTON_HEIGHT,
            items: BICst.CHART_LEGEND
        });

        this.legend.on(BI.Segment.EVENT_CHANGE, function(){
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        //数据标签
        this.showDataLabel = BI.createWidget({
            type: "bi.multi_select_item",
            value: BI.i18nText("BI-Show_Data_Label"),
            width: 115
        });

        this.showDataLabel.on(BI.Controller.EVENT_CHANGE, function(){
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        //网格线
        this.gridLine = BI.createWidget({
            type: "bi.multi_select_item",
            value: BI.i18nText("BI-Show_Grid_Line"),
            width: 115
        });

        this.gridLine.on(BI.Controller.EVENT_CHANGE, function(){
            self.fireEvent(BI.ScatterChartSetting.EVENT_CHANGE);
        });

        var showElement = BI.createWidget({
            type: "bi.horizontal_adapt",
            columnSize: [80],
            cls: "single-line-settings",
            items: [{
                type: "bi.label",
                textAlign: "left",
                lgap: this.constant.SIMPLE_H_LGAP,
                text: BI.i18nText("BI-Element_Show"),
                textHeight: this.constant.SINGLE_LINE_HEIGHT,
                cls: "line-title"
            }, {
                type: "bi.left",
                cls: "detail-style",
                items: BI.createItems([{
                    type: "bi.label",
                    text: BI.i18nText("BI-Legend_Normal"),
                    cls: "attr-names"
                }, {
                    type: "bi.center_adapt",
                    items: [this.legend]
                }, {
                    type: "bi.center_adapt",
                    items: [this.showDataLabel]
                }, {
                    type: "bi.center_adapt",
                    items: [this.gridLine]
                }], {
                    height: this.constant.SINGLE_LINE_HEIGHT
                }),
                lgap: this.constant.SIMPLE_H_GAP
            }]
        });

        var lYAxis = BI.createWidget({
            type: "bi.horizontal_adapt",
            columnSize: [80],
            cls: "single-line-settings",
            items: [{
                type: "bi.label",
                textHeight: this.constant.SINGLE_LINE_HEIGHT,
                textAlign: "left",
                lgap: this.constant.SIMPLE_H_LGAP,
                text: BI.i18nText("BI-Y_Axis"),
                cls: "line-title"
            }, {
                type: "bi.left",
                cls: "detail-style",
                items: BI.createItems([{
                    type: "bi.label",
                    text: BI.i18nText("BI-Format"),
                    cls: "attr-names"
                }, {
                    type: "bi.center_adapt",
                    items: [this.lYAxisStyle]
                }, {
                    type: "bi.label",
                    text: BI.i18nText("BI-Num_Level"),
                    lgap: this.constant.SIMPLE_H_GAP,
                    cls: "attr-names"
                }, {
                    type: "bi.center_adapt",
                    items: [this.numberLevellY]
                }, {
                    type: "bi.label",
                    text: BI.i18nText("BI-Unit_Normal"),
                    lgap: this.constant.SIMPLE_H_GAP,
                    cls: "attr-names"
                }, {
                    type: "bi.center_adapt",
                    items: [this.LYUnit]
                }, {
                    type: "bi.center_adapt",
                    items: [this.isShowTitleLY, this.editTitleLY]
                }], {
                    height: this.constant.SINGLE_LINE_HEIGHT
                }),
                lgap: this.constant.SIMPLE_H_GAP
            }]
        });

        var xAxis = BI.createWidget({
            type: "bi.horizontal_adapt",
            columnSize: [80],
            cls: "single-line-settings",
            items: [{
                type: "bi.label",
                textHeight: this.constant.SINGLE_LINE_HEIGHT,
                textAlign: "left",
                lgap: this.constant.SIMPLE_H_LGAP,
                text: BI.i18nText("BI-X_Axis"),
                cls: "line-title"
            }, {
                type: "bi.left",
                cls: "detail-style",
                items: BI.createItems([{
                    type: "bi.label",
                    text: BI.i18nText("BI-Format"),
                    cls: "attr-names"
                }, {
                    type: "bi.center_adapt",
                    items: [this.XAxisStyle]
                }, {
                    type: "bi.label",
                    text: BI.i18nText("BI-Num_Level"),
                    lgap: this.constant.SIMPLE_H_GAP,
                    cls: "attr-names"
                }, {
                    type: "bi.center_adapt",
                    items: [this.numberLevelX]
                }, {
                    type: "bi.label",
                    text: BI.i18nText("BI-Unit_Normal"),
                    lgap: this.constant.SIMPLE_H_GAP,
                    cls: "attr-names"
                }, {
                    type: "bi.center_adapt",
                    items: [this.XUnit]
                }, {
                    type: "bi.center_adapt",
                    items: [this.isShowTitleX, this.editTitleX]
                }], {
                    height: this.constant.SINGLE_LINE_HEIGHT
                }),
                lgap: this.constant.SIMPLE_H_GAP
            }]
        });

        //联动传递指标过滤条件
        this.transferFilter = BI.createWidget({
            type: "bi.multi_select_item",
            value: BI.i18nText("BI-Bind_Target_Condition"),
            width: 170
        });
        this.transferFilter.on(BI.Controller.EVENT_CHANGE, function(){
            self.fireEvent(BI.GroupTableSetting.EVENT_CHANGE);
        });

        var otherAttr = BI.createWidget({
            type: "bi.left_right_vertical_adapt",
            cls: "single-line-settings",
            items: {
                left: [{
                    type: "bi.label",
                    text: BI.i18nText("BI-Interactive_Attr"),
                    cls: "line-title"
                }, this.transferFilter]
            },
            height: this.constant.SINGLE_LINE_HEIGHT,
            lhgap: this.constant.SIMPLE_H_GAP
        });

        BI.createWidget({
            type: "bi.vertical",
            element: this.element,
            items: [tableStyle, lYAxis, xAxis, showElement, otherAttr],
            hgap: 10
        })
    },

    populate: function(){
        var wId = this.options.wId;

        var view = BI.Utils.getWidgetViewByID(wId);
        var titleLY = BI.Utils.getWSLeftYAxisTitleByID(wId);
        var titleX = BI.Utils.getWSXAxisTitleByID(wId);
        if(titleLY === ""){
            BI.any(view[BICst.REGION.TARGET1], function(idx, dId){
                if(BI.Utils.isDimensionUsable(dId)){
                    titleLY = BI.Utils.getDimensionNameByID(dId);
                    return true;
                }
                return false;
            });
        }
        if(titleX === ""){
            BI.any(view[BICst.REGION.DIMENSION1], function(idx, dId){
                if(BI.Utils.isDimensionUsable(dId)){
                    titleX = BI.Utils.getDimensionNameByID(dId);
                    return true;
                }
                return false;
            });
        }

        this.transferFilter.setSelected(BI.Utils.getWSTransferFilterByID(wId));
        this.colorSelect.setValue(BI.Utils.getWSChartColorByID(wId));
        this.lYAxisStyle.setValue(BI.Utils.getWSLeftYAxisStyleByID(wId));
        this.XAxisStyle.setValue(BI.Utils.getWSXAxisStyleByID(wId));
        this.numberLevellY.setValue(BI.Utils.getWSLeftYAxisNumLevelByID(wId));
        this.numberLevelX.setValue(BI.Utils.getWSXAxisNumLevelByID(wId));
        this.LYUnit.setValue(BI.Utils.getWSLeftYAxisUnitByID(wId));
        this.XUnit.setValue(BI.Utils.getWSXAxisUnitByID(wId));
        this.isShowTitleLY.setSelected(BI.Utils.getWSShowLeftYAxisTitleByID(wId));
        this.isShowTitleX.setSelected(BI.Utils.getWSShowXAxisTitleByID(wId));
        this.editTitleLY.setValue(titleLY);
        this.editTitleX.setValue(titleX);
        this.legend.setValue(BI.Utils.getWSChartLegendByID(wId));
        this.showDataLabel.setSelected(BI.Utils.getWSShowDataLabelByID(wId));
        this.gridLine.setSelected(BI.Utils.getWSShowGridLineByID(wId));

        this.isShowTitleLY.isSelected() ? this.editTitleLY.setVisible(true) : this.editTitleLY.setVisible(false);
        this.isShowTitleX.isSelected() ? this.editTitleX.setVisible(true) : this.editTitleX.setVisible(false);
    },

    getValue: function(){
        return {
            transfer_filter: this.transferFilter.isSelected(),
            chart_color: this.colorSelect.getValue()[0],
            left_y_axis_style: this.lYAxisStyle.getValue()[0],
            x_axis_style: this.XAxisStyle.getValue()[0],
            left_y_axis_number_level: this.numberLevellY.getValue()[0],
            x_axis_number_level: this.numberLevelX.getValue()[0],
            left_y_axis_unit: this.LYUnit.getValue(),
            x_axis_unit: this.XUnit.getValue(),
            show_left_y_axis_title: this.isShowTitleLY.isSelected(),
            show_x_axis_title: this.isShowTitleX.isSelected(),
            left_y_axis_title: this.editTitleLY.getValue(),
            x_axis_title: this.editTitleX.getValue(),
            chart_legend: this.legend.getValue()[0],
            show_data_label: this.showDataLabel.isSelected(),
            show_grid_line: this.gridLine.isSelected()
        }
    },

    setValue: function(v){
        this.transferFilter.setSelected(v.transfer_filter);
        this.colorSelect.setValue(v.chart_color);
        this.lYAxisStyle.setValue(v.left_y_axis_style);
        this.XAxisStyle.setValue(v.x_axis_style);
        this.numberLevellY.setValue(v.left_y_axis_number_level);
        this.numberLevelX.setValue(v.x_axis_number_level);
        this.LYUnit.setValue(v.left_y_axis_unit);
        this.XUnit.setValue(v.x_axis_unit);
        this.isShowTitleLY.setSelected(v.show_left_y_axis_title);
        this.isShowTitleX.setSelected(v.x_axis_title);
        this.editTitleLY.setValue(v.left_y_axis_title);
        this.editTitleX.setValue(v.x_axis_title);
        this.legend.setValue(v.chart_legend);
        this.showDataLabel.setSelected(v.show_data_label);
        this.gridLine.setSelected(v.show_grid_line);
    }
});
BI.ScatterChartSetting.EVENT_CHANGE = "EVENT_CHANGE";
$.shortcut("bi.scatter_chart_setting", BI.ScatterChartSetting);