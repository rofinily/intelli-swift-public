 /**
 * @class BI.MultiAxisChartSetting
 * @extends BI.Widget
 * 多值轴组合图样式
 */
BI.MultiAxisChartSetting = BI.inherit(BI.AbstractChartSetting, {

    _defaultConfig: function () {
        return BI.extend(BI.MultiAxisChartSetting.superclass._defaultConfig.apply(this, arguments), {
            baseCls: "bi-charts-setting bi-multi-axis-chart-setting"
        })
    },

    _init: function () {
        BI.MultiAxisChartSetting.superclass._init.apply(this, arguments);
        var self = this, o = this.options, constant = BI.AbstractChartSetting;

        //组件设置
        this.widgetSetting = BI.createWidget({
            type: "bi.widget_block_setting",
            wId: o.wId
        });

        this.widgetSetting.on(BI.WidgetBlockSetting.EVENT_CHANGE, function() {
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE)
        });

        this.colorSelect = BI.createWidget({
            type: "bi.chart_setting_select_color_combo",
            width: 130
        });
        this.colorSelect.populate();

        this.colorSelect.on(BI.ChartSettingSelectColorCombo.EVENT_CHANGE, function () {
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE);
        });

        //风格——1、2、3
        this.chartSyleGroup = BI.createWidget({
            type: "bi.button_group",
            items: BI.createItems(BICst.AXIS_STYLE_GROUP, {
                type: "bi.icon_button",
                extraCls: "chart-style-font",
                width: constant.BUTTON_WIDTH,
                height: constant.BUTTON_HEIGHT,
                iconWidth: constant.ICON_WIDTH,
                iconHeight: constant.ICON_HEIGHT
            }),
            layouts: [{
                type: "bi.vertical_adapt",
                height: constant.SINGLE_LINE_HEIGHT
            }]
        });
        this.chartSyleGroup.on(BI.ButtonGroup.EVENT_CHANGE, function () {
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE);
        });

        this.tableStyle = BI.createWidget({
            type: "bi.horizontal_adapt",
            columnSize: [100],
            cls: "single-line-settings",
            items: [{
                type: "bi.label",
                text: BI.i18nText("BI-Table_Sheet_Style"),
                lgap: constant.SIMPLE_H_LGAP,
                textAlign: "left",
                cls: "line-title"
            }, {
                type: "bi.left",
                cls: "detail-style",
                items: BI.createItems([{
                    type: "bi.label",
                    text: BI.i18nText("BI-Color_Setting"),
                    cls: "attr-names"
                }, {
                    el: {
                        type: "bi.vertical_adapt",
                        items: [this.colorSelect]
                    },
                    lgap: constant.SIMPLE_H_GAP
                }, {
                    type: "bi.label",
                    text: BI.i18nText("BI-Table_Style"),
                    cls: "attr-names",
                    lgap: constant.SIMPLE_H_GAP
                }, {
                    el: {
                        type: "bi.vertical_adapt",
                        items: [this.chartSyleGroup]
                    },
                    lgap: constant.SIMPLE_H_GAP
                }], {
                    height: constant.SINGLE_LINE_HEIGHT
                })
            }]
        });

        //左值轴设置
        this.lValueAxisSetting = BI.createWidget({
            type: "bi.value_axis_block_setting",
            headText: BI.i18nText("BI-Left_Value_Axis"),
            wId: o.wId
        });

        this.lValueAxisSetting.on(BI.ValueAxisBlockSetting.EVENT_CHANGE, function () {
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE)
        });

        //右值轴配置
        this.rValueAxisSetting = BI.createWidget({
            type: "bi.value_axis_block_setting",
            headText: BI.i18nText("BI-Right_Value_Axis_One"),
            wId: o.wId
        });

        this.rValueAxisSetting.on(BI.ValueAxisBlockSetting.EVENT_CHANGE, function () {
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE)
        });

        //右值轴配置
        this.r2ValueAxisSetting = BI.createWidget({
            type: "bi.value_axis_block_setting",
            headText: BI.i18nText("BI-Right_Value_Axis_Two"),
            wId: o.wId
        });

        this.r2ValueAxisSetting.on(BI.ValueAxisBlockSetting.EVENT_CHANGE, function () {
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE)
        });

        //横轴文本方向
        this.text_direction = BI.createWidget({
            type: "bi.sign_editor",
            width: constant.EDITOR_WIDTH,
            height: constant.EDITOR_HEIGHT,
            cls: "unit-input",
            allowBlank: false,
            value: "0",
            errorText: BI.i18nText("BI-Please_Enter_Number_From_To_To", -90, 90),
            validationChecker: function (v) {
                return BI.isInteger(v) && v >= -90 && v <= 90;
            }
        });
        this.text_direction.on(BI.SignEditor.EVENT_CONFIRM, function () {
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE);
        });

        this.isShowTitleX = BI.createWidget({
            type: "bi.multi_select_item",
            value: BI.i18nText("BI-Show_Title"),
            width: 90
        });

        this.isShowTitleX.on(BI.Controller.EVENT_CHANGE, function () {
            this.isSelected() ? self.editTitleX.setVisible(true) : self.editTitleX.setVisible(false);
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE);
        });

        this.editTitleX = BI.createWidget({
            type: "bi.sign_editor",
            width: constant.EDITOR_WIDTH,
            height: constant.EDITOR_HEIGHT,
            cls: "unit-input"
        });

        this.editTitleX.on(BI.SignEditor.EVENT_CONFIRM, function () {
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE);
        });

        //图例
        this.legend = BI.createWidget({
            type: "bi.segment",
            width: constant.LEGEND_SEGMENT_WIDTH,
            height: constant.BUTTON_HEIGHT,
            items: BICst.CHART_LEGEND
        });

        this.legend.on(BI.Segment.EVENT_CHANGE, function () {
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE);
        });

        //数据标签
        this.showDataLabel = BI.createWidget({
            type: "bi.multi_select_item",
            value: BI.i18nText("BI-Show_Data_Label"),
            width: 115
        });

        this.showDataLabel.on(BI.Controller.EVENT_CHANGE, function () {
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE);
        });

        //数据表格
        this.showDataTable = BI.createWidget({
            type: "bi.multi_select_item",
            value: BI.i18nText("BI-Show_Data_Table"),
            width: 115
        });

        this.showDataTable.on(BI.Controller.EVENT_CHANGE, function () {
            if (this.isSelected()) {
                self.showZoom.setSelected(false);
            }
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE);
        });

        //网格线
        this.gridLine = BI.createWidget({
            type: "bi.multi_select_item",
            value: BI.i18nText("BI-Show_Grid_Line"),
            width: 115
        });

        this.gridLine.on(BI.Controller.EVENT_CHANGE, function () {
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE);
        });

        //图表缩放滚轮
        this.showZoom = BI.createWidget({
            type: "bi.multi_select_item",
            value: BI.i18nText("BI-Show_Zoom"),
            width: 140
        });

        this.showZoom.on(BI.Controller.EVENT_CHANGE, function () {
            if (this.isSelected()) {
                self.showDataTable.setSelected(false);
            }
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE);
        });

        this.showElement = BI.createWidget({
            type: "bi.horizontal_adapt",
            columnSize: [80],
            cls: "single-line-settings",
            items: [{
                type: "bi.label",
                text: BI.i18nText("BI-Element_Show"),
                lgap: constant.SIMPLE_H_LGAP,
                textAlign: "left",
                textHeight: constant.SINGLE_LINE_HEIGHT,
                cls: "line-title"
            }, {
                type: "bi.left",
                cls: "detail-style",
                items: BI.createItems([{
                    type: "bi.label",
                    text: BI.i18nText("BI-Legend_Normal"),
                    cls: "attr-names"
                }, {
                    type: "bi.vertical_adapt",
                    items: [this.legend]
                }, {
                    type: "bi.vertical_adapt",
                    items: [this.gridLine]
                }, {
                    type: "bi.vertical_adapt",
                    items: [this.showDataLabel]
                }, {
                    type: "bi.vertical_adapt",
                    items: [this.showDataTable]
                }, {
                    type: "bi.vertical_adapt",
                    items: [this.showZoom]
                }], {
                    height: constant.SINGLE_LINE_HEIGHT
                }),
                lgap: constant.SIMPLE_H_GAP
            }]
        });

        this.xAxis = BI.createWidget({
            type: "bi.horizontal_adapt",
            columnSize: [80],
            cls: "single-line-settings",
            items: [{
                type: "bi.label",
                text: BI.i18nText("BI-Category_Axis"),
                lgap: constant.SIMPLE_H_LGAP,
                textAlign: "left",
                cls: "line-title"
            }, {
                type: "bi.left",
                cls: "detail-style",
                items: BI.createItems([{
                    type: "bi.label",
                    text: BI.i18nText("BI-Text_Direction"),
                    cls: "attr-names"
                }, {
                    type: "bi.vertical_adapt",
                    items: [this.text_direction]
                }, {
                    type: "bi.label",
                    text: "。",
                    textHeight: 30,
                    height: constant.SINGLE_LINE_HEIGHT
                }, {
                    type: "bi.vertical_adapt",
                    items: [this.isShowTitleX]
                }, {
                    type: "bi.vertical_adapt",
                    items: [this.editTitleX]
                }], {
                    height: constant.SINGLE_LINE_HEIGHT
                }),
                lgap: constant.SIMPLE_H_GAP
            }]
        });

        //联动传递指标过滤条件
        this.transferFilter = BI.createWidget({
            type: "bi.multi_select_item",
            value: BI.i18nText("BI-Bind_Target_Condition"),
            width: 170
        });
        this.transferFilter.on(BI.Controller.EVENT_CHANGE, function () {
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE);
        });

        this.otherAttr = BI.createWidget({
            type: "bi.left_right_vertical_adapt",
            cls: "single-line-settings",
            items: {
                left: [{
                    type: "bi.label",
                    text: BI.i18nText("BI-Interactive_Attr"),
                    cls: "line-title"
                }, this.transferFilter]
            },
            height: constant.SINGLE_LINE_HEIGHT,
            lhgap: constant.SIMPLE_H_GAP
        });

        //极简模式
        this.minimalistModel = BI.createWidget({
            type: "bi.multi_select_item",
            value: BI.i18nText("BI-Minimalist_Model"),
            width: 170
        });

        this.minimalistModel.on(BI.Controller.EVENT_CHANGE, function () {
            self._invisible(!this.isSelected());
            self.fireEvent(BI.MultiAxisChartSetting.EVENT_CHANGE)
        });

        var modelChange = BI.createWidget({
            type: "bi.left_right_vertical_adapt",
            cls: "single-line-settings",
            items: {
                left: [{
                    type: "bi.label",
                    text: BI.i18nText("BI-Mode_Change"),
                    cls: "line-title"
                }, this.minimalistModel]
            },
            height: constant.SINGLE_LINE_HEIGHT,
            lhgap: constant.SIMPLE_H_GAP
        });

        BI.createWidget({
            type: "bi.vertical",
            element: this.element,
            items: [this.widgetSetting, this.tableStyle, this.lValueAxisSetting, this.rValueAxisSetting, this.r2ValueAxisSetting, this.xAxis, this.showElement, this.otherAttr, modelChange],
            hgap: 10
        })
    },

    _invisible: function (v) {
        this.tableStyle.setVisible(v);
        this.lValueAxisSetting.setVisible(v);
        this.xAxis.setVisible(v);
        this.rValueAxisSetting.setVisible(v);
        this.r2ValueAxisSetting.setVisible(v);
        this.showElement.setVisible(v);
        this.otherAttr.setVisible(v);
    },

    populate: function () {
        var wId = this.options.wId;

        var view = BI.Utils.getWidgetViewByID(wId);
        var titleX = BI.Utils.getWSXAxisTitleByID(wId);
        if (titleX === "") {
            BI.any(view[BICst.REGION.DIMENSION1], function (idx, dId) {
                if (BI.Utils.isDimensionUsable(dId)) {
                    titleX = BI.Utils.getDimensionNameByID(dId);
                    return true;
                }
                return false;
            });
        }
        this.widgetSetting.populate();
        this.colorSelect.setValue(BI.Utils.getWSChartColorByID(wId));
        this.chartSyleGroup.setValue(BI.Utils.getWSChartStyleByID(wId));
        this.lValueAxisSetting.setValue(BI.Utils.getWSLeftValueAxisSettingByID(wId));
        this.rValueAxisSetting.setValue(BI.Utils.getWSRightValueAxisSettingByID(wId));
        this.r2ValueAxisSetting.setValue(BI.Utils.getWSRight2ValueAxisSettingByID(wId));

        this.isShowTitleX.setSelected(BI.Utils.getWSShowXAxisTitleByID(wId));
        this.editTitleX.setValue(titleX);
        this.text_direction.setValue(BI.Utils.getWSTextDirectionByID(wId));
        this.legend.setValue(BI.Utils.getWSChartLegendByID(wId));
        this.showDataLabel.setSelected(BI.Utils.getWSShowDataLabelByID(wId));
        this.showDataTable.setSelected(BI.Utils.getWSShowDataTableByID(wId));
        this.gridLine.setSelected(BI.Utils.getWSShowGridLineByID(wId));
        this.showZoom.setSelected(BI.Utils.getWSShowZoomByID(wId));
        this.transferFilter.setSelected(BI.Utils.getWSTransferFilterByID(wId));
        this.minimalistModel.setSelected(BI.Utils.getWSMinimalistByID(wId));
        this._invisible(!BI.Utils.getWSMinimalistByID(wId));

        this.isShowTitleX.isSelected() ? this.editTitleX.setVisible(true) : this.editTitleX.setVisible(false);
    },

    getValue: function () {
        return {
            widget_setting: this.widgetSetting.getValue(),
            chart_color: this.colorSelect.getValue()[0],
            chart_style: this.chartSyleGroup.getValue()[0],
            left_axis_setting: this.lValueAxisSetting.getValue(),
            right_axis_setting: this.rValueAxisSetting.getValue(),
            right2_axis_setting: this.r2ValueAxisSetting.getValue(),

            show_x_axis_title: this.isShowTitleX.isSelected(),
            x_axis_title: this.editTitleX.getValue(),
            text_direction: this.text_direction.getValue(),
            chart_legend: this.legend.getValue()[0],
            show_data_label: this.showDataLabel.isSelected(),
            show_data_table: this.showDataTable.isSelected(),
            show_grid_line: this.gridLine.isSelected(),
            show_zoom: this.showZoom.isSelected(),
            transfer_filter: this.transferFilter.isSelected(),
            minimalist_model: this.minimalistModel.isSelected(),
        }
    },

    setValue: function (v) {
        this.widgetSetting.setValue(v.widget_setting);
        this.colorSelect.setValue(v.chart_color);
        this.chartSyleGroup.setValue(v.chart_style);
        this.lValueAxisSetting.setValue(v.left_axis_setting);
        this.rValueAxisSetting.setValue(v.right_axis_setting);
        this.r2ValueAxisSetting.setValue(v.right2_axis_setting);

        this.isShowTitleX.setSelected(v.x_axis_title);
        this.editTitleX.setValue(v.x_axis_title);
        this.text_direction.setValue(v.text_direction);
        this.legend.setValue(v.chart_legend);
        this.showDataLabel.setSelected(v.show_data_label);
        this.showDataTable.setSelected(v.show_data_table);
        this.gridLine.setSelected(v.show_grid_line);
        this.showZoom.setSelected(v.show_zoom);
        this.transferFilter.setSelected(v.transfer_filter);
        this.minimalistModel.setSelected(v.minimalist_model);
    }
});
BI.MultiAxisChartSetting.EVENT_CHANGE = "EVENT_CHANGE";
$.shortcut("bi.multi_axis_chart_setting", BI.MultiAxisChartSetting);
