/**
 * Created by Young's on 2017/1/18.
 */
BI.CrossTableModel = BI.inherit(BI.GroupTableModel, {
    _init: function () {
        BI.CrossTableModel.superclass._init.apply(this, arguments);
        this.crossTree = new BI.Tree();
        this.crossETree = new BI.Tree();
    },

    isNeed2Freeze: function () {
        if (this.targetIds.length === 0 || (this.dimIds.length + this.crossDimIds.length) === 0) {
            return false;
        }
        return this.freezeDim;
    },

    resetETree: function () {
        this.eTree = new BI.Tree();
        this.crossETree = new BI.Tree();
    },

    getExtraInfo: function () {
        var op = {};
        op.expander = {
            x: {
                type: BI.Utils.getWSOpenColNodeByID(this.wId),
                value: [this._formatExpanderTree(this.crossETree.toJSONWithNode())]
            },
            y: {
                type: BI.Utils.getWSOpenRowNodeByID(this.wId),
                value: [this._formatExpanderTree(this.eTree.toJSONWithNode())]
            }
        };
        op.clickvalue = this.clickValue;
        op.page = this.pageOperator;
        op.status = this.status;
        op.real_data = true;
        if (this.status === BICst.WIDGET_STATUS.DETAIL) {
            op.real_data = BI.Utils.isShowWidgetRealDataByID(this.wId) || false;
        }
        return op;
    },

    _refreshDimsInfo: function () {
        //使用中的行表头——考虑钻取
        var self = this;
        this.dimIds = [];
        this.crossDimIds = [];
        var view = BI.Utils.getWidgetViewByID(this.wId);
        var drill = BI.Utils.getDrillByID(this.wId);

        BI.each(view[BICst.REGION.DIMENSION1], function (i, dId) {
            BI.Utils.isDimensionUsable(dId) && (self.dimIds.push(dId));
        });
        BI.each(view[BICst.REGION.DIMENSION2], function (i, dId) {
            BI.Utils.isDimensionUsable(dId) && (self.crossDimIds.push(dId));
        });
        BI.each(drill, function (drId, drArray) {
            if (drArray.length !== 0) {
                var dIndex = self.dimIds.indexOf(drId), cIndex = self.crossDimIds.indexOf(drId);
                BI.remove(self.dimIds, drId);
                BI.remove(self.crossDimIds, drId);
                BI.each(drArray, function (i, dr) {
                    var tempDrId = dr.dId;
                    if (i === drArray.length - 1) {
                        if (BI.Utils.getRegionTypeByDimensionID(drId) === BICst.REGION.DIMENSION1) {
                            self.dimIds.splice(dIndex, 0, tempDrId);
                        } else {
                            self.crossDimIds.splice(cIndex, 0, tempDrId);
                        }
                    } else {
                        BI.remove(self.dimIds, tempDrId);
                        BI.remove(self.crossDimIds, tempDrId);
                    }
                });
            }
        });

        //使用中的指标
        this.targetIds = [];
        BI.each(view[BICst.REGION.TARGET1], function (i, dId) {
            BI.Utils.isDimensionUsable(dId) && (self.targetIds.push(dId));
        });
    },

    _resetPartAttrs: function () {
        BI.CrossTableModel.superclass._resetPartAttrs.apply(this, arguments);
        this.crossHeader = [];
        this.crossItems = [];
    },

    /**
     * 展开所有节点下的收起   纵向
     */
    _addNode2crossETree4OpenColNode: function (nodeId) {
        var self = this;
        var clickNode = self.crossETree.search(nodeId);
        if (BI.isNull(clickNode)) {
            //找到原始tree的这个节点的所有父节点，遍历一遍是否存在于eTree中
            //a、存在，向eTree直接添加；b、不存在，把这些父级节点都添加进去
            var pNodes = [];
            while (true) {
                if (BI.isNull(this.crossETree.search(nodeId))) {
                    var node = this.crossTree.search(nodeId);
                    pNodes.push(node);
                    if (node.getParent().get("id") === this.crossTree.getRoot().get("id")) {
                        break;
                    }
                } else {
                    break;
                }
                nodeId = this.crossTree.search(nodeId).getParent().get("id");
            }
            pNodes.reverse();
            BI.each(pNodes, function (i, pNode) {
                var epNode = self.crossETree.search(pNode.getParent().get("id"));
                pNode.removeAllChilds();
                self.crossETree.addNode(BI.isNotNull(epNode) ? epNode : self.crossETree.getRoot(), BI.deepClone(pNode));
            });
        } else {
            //如果已经在这个eTree中，应该删除当前节点所在的树
            function getFinalParent(nodeId) {
                var node = self.crossETree.search(nodeId);
                if (node.getParent().get("id") === self.crossETree.getRoot().get("id")) {
                    return nodeId;
                } else {
                    return getFinalParent(node.getParent().get("id"));
                }
            }

            if (this.crossETree.search(nodeId).getParent().getChildrenLength() > 1) {
                this.crossETree.search(nodeId).getParent().removeChild(nodeId);
            } else if (this.crossETree.search(nodeId).getChildrenLength() > 0) {
                //此时应该是做收起，把所有的children都remove掉
                this.crossETree.search(nodeId).removeAllChilds();
            } else {
                this.crossETree.getRoot().removeChild(getFinalParent(nodeId));
            }
        }
    },

    /**
     * 交叉表——crossItems
     */
    _createCrossPartItems: function (c, currentLayer, parent) {
        var self = this, crossHeaderItems = [];
        currentLayer++;
        BI.each(c, function (i, child) {
            if (BI.isNull(child.c) && (self.targetIds.contains(child.n) || self.crossDimIds.contains(child.n))) {
                return;
            }
            var cId = BI.isEmptyString(child.n) ? self.EMPTY_VALUE : child.n;
            var currDid = self.crossDimIds[currentLayer - 1], currValue = child.n;
            var nodeId = BI.isNotNull(parent) ? parent.get("id") + cId : cId;
            var node = new BI.Node(nodeId);
            node.set("name", child.n);
            node.set("dId", currDid);
            self.crossTree.addNode(parent, node);
            var pValues = [];
            var tempLayer = currentLayer, tempNodeId = nodeId;
            while (tempLayer > 0) {
                var dId = self.crossDimIds[tempLayer - 1];
                pValues.push({
                    value: [BI.Utils.getClickedValue4Group(self.crossTree.search(tempNodeId).get("name"), dId)],
                    dId: self.crossDimIds[tempLayer - 1]
                });
                tempNodeId = self.crossTree.search(tempNodeId).getParent().get("id");
                tempLayer--;
            }
            var item = {
                type: "bi.normal_expander_cell",
                text: currValue,
                dId: currDid,
                isCross: true,
                styles: BI.SummaryTableHelper.getHeaderStyles(self.themeColor, self.tableStyle),
                tag: BI.UUID(),
                expandCallback: function () {
                    var clickNode = self.crossETree.search(nodeId);
                    //全部展开再收起——纵向
                    if (self.openColNode === true) {
                        self._addNode2crossETree4OpenColNode(nodeId);
                    } else {
                        if (BI.isNull(clickNode)) {
                            self.crossETree.addNode(self.crossETree.search(BI.isNull(parent) ? self.crossTree.getRoot().get("id") : parent.get("id")), BI.deepClone(node));
                        } else {
                            clickNode.getParent().removeChild(nodeId);
                        }
                    }
                    self.pageOperator = BICst.TABLE_PAGE_OPERATOR.EXPAND;
                    self.clickValue = child.n;
                    self.expanderCallback();
                },
                drillCallback: function () {
                    var regionType = BI.Utils.getRegionTypeByDimensionID(currDid);
                    var obj = {};
                    if (pValues.length > 0) {
                        BI.removeAt(pValues, 0);
                    }
                    if (regionType < BICst.REGION.DIMENSION2) {
                        obj.xValue = child.n;
                        obj.pValues = pValues;
                    } else {
                        obj.zValue = child.n;
                        obj.pValues = pValues;
                    }
                    obj.dimensionIds = [currDid];
                    BI.Broadcasts.send(BICst.BROADCAST.CHART_CLICK_PREFIX + self.wId, obj);
                }
            };
            if (currentLayer < self.crossDimIds.length) {
                item.needExpand = true;
                item.isExpanded = false;
            }
            if (BI.isNotNull(child.c)) {
                var children = self._createCrossPartItems(child.c, currentLayer, node);
                if (BI.isNotEmptyArray(children)) {
                    item.children = self._createCrossPartItems(child.c, currentLayer, node);
                    item.isExpanded = true;
                }
            }
            var hasSum = false;
            if (BI.isNotNull(self.crossItemsSums) &&
                BI.isNotNull(self.crossItemsSums[currentLayer]) &&
                self.crossItemsSums[currentLayer][i] === true) {
                hasSum = true;
            }
            if (hasSum === true &&
                self.showColTotal === true &&
                BI.isNotEmptyArray(item.children)) {
                if (self._isOnlyCrossAndTarget()) {
                    item.values = [""];
                } else {
                    BI.each(self.targetIds, function (k, tId) {
                        item.values = [];
                        BI.each(self.targetIds, function (k, tarId) {
                            item.values.push("");
                        });
                    });
                }
            }
            if (self.showColTotal === true || BI.isNull(item.children)) {
                if (self._isOnlyCrossAndTarget()) {
                    item.values = [""];
                } else {
                    item.values = BI.makeArray(self.targetIds.length, "");
                }
            }
            crossHeaderItems.push(item);
            if (BI.isNull(self.columnContentCache[self.dimIds.length + currentLayer - 1])) {
                self.columnContentCache[self.dimIds.length + currentLayer - 1] = [];
            }
            self.columnContentCache[self.dimIds.length + currentLayer - 1].push(item);
        });
        return crossHeaderItems;
    },

    /**
     * 交叉表——header and crossHeader
     */
    _createCrossTableHeader: function () {
        var self = this;
        BI.each(this.dimIds, function (i, dId) {
            if (BI.isNotNull(dId)) {
                self.header.push({
                    type: "bi.normal_header_cell",
                    dId: dId,
                    text: BI.Utils.getDimensionNameByID(dId),
                    styles: BI.SummaryTableHelper.getHeaderStyles(self.themeColor, self.tableStyle),
                    sortFilterChange: function (v) {
                        self.resetETree();
                        self.pageOperator = BICst.TABLE_PAGE_OPERATOR.REFRESH;
                        self.headerOperatorCallback(v, dId);
                    },
                });
            }
        });
        BI.each(this.crossDimIds, function (i, dId) {
            if (BI.isNotNull(dId)) {
                self.crossHeader.push({
                    type: "bi.normal_header_cell",
                    dId: dId,
                    text: BI.Utils.getDimensionNameByID(dId),
                    styles: BI.SummaryTableHelper.getHeaderStyles(self.themeColor, self.tableStyle),
                    sortFilterChange: function (v) {
                        self.resetETree();
                        self.pageOperator = BICst.TABLE_PAGE_OPERATOR.REFRESH;
                        self.headerOperatorCallback(v, dId);
                    },
                });
            }
        });

        var targetsArray = [];
        BI.each(this.targetIds, function (i, tId) {
            if (BI.isNotNull(tId)) {
                targetsArray.push({
                    type: "bi.page_table_cell",
                    cls: "cross-table-target-header",
                    styles: BI.SummaryTableHelper.getHeaderStyles(self.themeColor, self.tableStyle),
                    text: BI.Utils.getDimensionNameByID(tId),
                    title: BI.Utils.getDimensionNameByID(tId)
                });
            }
        });

        //根据crossItems创建部分header
        if (!this._isOnlyCrossAndTarget()) {
            this._createCrossPartHeader();
        }
    },

    /**
     * 交叉表 items and crossItems
     */
    _createCrossTableItems: function () {
        var self = this;
        var top = this.data.t, left = this.data.l;

        //根据所在的层，汇总情况——是否含有汇总
        this.crossItemsSums = [];
        this.crossItemsSums[0] = [];
        if (BI.isNotNull(left.s)) {
            this.crossItemsSums[0].push(true);
        }
        this._initCrossItemsSum(0, left.c, this.crossItemsSums);

        //交叉表items
        var crossItem = {
            children: this._createCrossPartItems(top.c, 0)
        };
        if (this.showColTotal === true) {
            if (this._isOnlyCrossAndTarget()) {
                crossItem.children.push({
                    type: "bi.page_table_cell",
                    text: BI.i18nText("BI-Summary_Values"),
                    styles: BI.SummaryTableHelper.getHeaderStyles(this.getThemeColor(), this.getTableStyle())
                });
            } else {
                BI.each(this.targetIds, function (i, tId) {
                    crossItem.children.push({
                        type: "bi.normal_header_cell",
                        dId: tId,
                        text: BI.i18nText("BI-Summary_Values"),
                        styles: BI.SummaryTableHelper.getHeaderStyles(self.themeColor, self.tableStyle),
                        tag: BI.UUID(),
                        sortFilterChange: function (v) {
                            self.resetETree();
                            self.pageOperator = BICst.TABLE_PAGE_OPERATOR.REFRESH;
                            self.headerOperatorCallback(v, tId);
                        },
                        isSum: true,
                    });
                });
            }
        }
        this.crossItems = [crossItem];

        //用cross parent value来对应到联动的时候的列表头值
        this.crossPV = [];
        function parseCrossItem2Array(crossItems, pValues, pv) {
            BI.each(crossItems, function (i, crossItem) {
                if (BI.isNotNull(crossItem.children)) {
                    var tempPV = [];
                    if (BI.isNotNull(crossItem.dId)) {
                        if (BI.isNotEmptyArray(crossItem.values)) {
                            BI.each(crossItem.values, function (j, v) {
                                tempPV = pv.concat([{
                                    dId: crossItem.dId,
                                    value: [BI.Utils.getClickedValue4Group(crossItem.text, crossItem.dId)]
                                }]);
                            });
                            //显示列汇总的时候需要构造汇总
                        } else {
                            tempPV = pv.concat([{
                                dId: crossItem.dId,
                                value: [BI.Utils.getClickedValue4Group(crossItem.text, crossItem.dId)]
                            }]);
                        }
                    }
                    parseCrossItem2Array(crossItem.children, pValues, tempPV);
                    //汇总
                    if (BI.isNotEmptyArray(crossItem.values)) {
                        BI.each(crossItem.values, function (j, v) {
                            pValues.push([{
                                dId: crossItem.dId,
                                value: [BI.Utils.getClickedValue4Group(crossItem.text, crossItem.dId)]
                            }]);
                        });
                    }
                } else if (BI.isNotNull(crossItem.dId)) {
                    if (BI.isNotEmptyArray(crossItem.values)) {
                        BI.each(crossItem.values, function (j, v) {
                            pValues.push(pv.concat([{
                                dId: crossItem.dId,
                                value: [BI.Utils.getClickedValue4Group(crossItem.text, crossItem.dId)]
                            }]));
                        });
                    } else {
                        // pValues.push(pv.concat([{dId: crossItem.dId, value: [crossItem.text]}]));
                        //最外层
                        pValues.push([]);
                    }
                } else if (BI.isNotNull(crossItem.isSum)) {
                    pValues.push(pv);
                }
            });
        }

        parseCrossItem2Array(this.crossItems, this.crossPV, []);

        //无行表头 有列表头、指标
        if (this._isOnlyCrossAndTarget()) {
            this.items = this._createItems4OnlyCrossAndTarget(this.data, this.crossPV);
            return;
        }

        var item = {
            children: this._createCommonTableItems(left.c, 0, null, this.dimIds, this.crossPV)
        };
        if (this.showRowTotal === true) {
            //汇总值
            var sums = [], ob = {index: 0};
            if (BI.isNotNull(left.s.c) && BI.isNotNull(left.s.s)) {
                this._createTableSumItems(left.s.c, sums, [], ob, true, null, this.crossPV);
            } else {
                BI.isArray(left.s) && this._createTableSumItems(left.s, sums, [], ob, true, null, this.crossPV);
            }
            if (this.showColTotal === true) {
                var outerValues = [];
                BI.each(left.s.s, function (i, v) {
                    if (self.targetIds.length > 0) {
                        var tId = self.targetIds[i];
                        outerValues.push({
                            type: "bi.target_body_normal_cell",
                            text: v,
                            dId: tId,
                            cls: "summary-cell last",
                            styles: BI.SummaryTableHelper.getLastSummaryStyles(self.themeColor, self.tableStyle),
                            clicked: [{}]
                        });
                    }
                });
                BI.each(sums, function (i, sum) {
                    sums[i].cls = "summary-cell last"
                });
                sums = sums.concat(outerValues);
            }
            item.values = sums;
        }
        this.items = [item];
    },

    /**
     * 交叉表的(指标)汇总值
     * @param s json中的s节点数据
     * @param sum 汇总格子列表
     * @param pValues parentValues
     * @param ob 记录index
     * @param isLast 是否为最后一个
     * @param rowIndex 行号（用于样式）
     * @param crossPV 交叉部分的parentValues
     * @private
     */
    _createTableSumItems: function (s, sum, pValues, ob, isLast, rowIndex, crossPV) {
        var self = this;
        BI.each(s, function (i, v) {
            if (BI.isObject(v)) {
                var sums = v.s, child = v.c;
                if (BI.isNotNull(sums) && BI.isNotNull(child)) {
                    self._createTableSumItems(child, sum, pValues, ob, isLast, rowIndex, crossPV);
                    self.showColTotal === true && self._createTableSumItems(sums, sum, pValues, ob, isLast, rowIndex, crossPV);
                } else if (BI.isNotNull(sums)) {
                    self._createTableSumItems(sums, sum, pValues, ob, isLast, rowIndex, crossPV);
                }
            } else {
                var tId = self.targetIds[i];
                if (self.targetIds.length === 0) {
                    tId = self.crossDimIds[i];
                }

                sum.push({
                    type: "bi.target_body_normal_cell",
                    text: v,
                    dId: tId,
                    clicked: pValues.concat(crossPV[ob.index]),
                    cls: isLast ? "last summary-cell" : "",
                    styles: isLast ? BI.SummaryTableHelper.getLastSummaryStyles(self.themeColor, self.tableStyle) :
                        BI.SummaryTableHelper.getBodyStyles(self.themeColor, self.tableStyle, rowIndex)
                });
                ob.index++;
            }
        });
    },

    /**
     * 交叉表——crossHeader
     */
    _createCrossPartHeader: function () {
        var self = this;
        var dId = null;
        //可以直接根据crossItems确定header的后半部分
        function parseHeader(items) {
            BI.each(items, function (i, item) {
                var dName = BI.Utils.getDimensionNameByID(self.targetIds[i % (self.targetIds.length)]) || "--";
                if (BI.isNotNull(item.children)) {
                    parseHeader(item.children);
                    if (BI.isNotNull(item.values) && self.showColTotal === true) {
                        BI.each(self.targetIds, function (j, tarId) {
                            self.header.push({
                                type: "bi.page_table_cell",
                                cls: "cross-table-target-header",
                                styles: BI.SummaryTableHelper.getHeaderStyles(self.themeColor, self.tableStyle),
                                text: BI.i18nText("BI-Summary_Values") + ":" + BI.Utils.getDimensionNameByID(tarId),
                                title: BI.i18nText("BI-Summary_Values") + ":" + BI.Utils.getDimensionNameByID(tarId),
                                tag: BI.UUID()
                            });
                        });
                    }
                } else if (BI.isNotNull(item.isSum)) {
                    //合计
                    item.text = BI.i18nText("BI-Summary_Values") + ":" + BI.Utils.getDimensionNameByID(item.dId);
                    item.cls = "cross-table-target-header";
                    self.header.push(item);
                } else if (BI.isNotEmptyArray(item.values)) {
                    //单指标情况下，指标不显示，合并到上面
                    if (self.targetIds.length === 1) {
                        self.header.push(item);
                    } else {
                        BI.each(item.values, function (k, v) {
                            self.header.push({
                                type: "bi.page_table_cell",
                                cls: "cross-table-target-header",
                                styles: BI.SummaryTableHelper.getHeaderStyles(self.themeColor, self.tableStyle),
                                text: BI.Utils.getDimensionNameByID(self.targetIds[k]),
                                title: BI.Utils.getDimensionNameByID(self.targetIds[k]),
                                tag: BI.UUID()
                            })
                        });
                    }
                } else {
                    self.header.push({
                        type: "bi.page_table_cell",
                        cls: "cross-table-target-header",
                        styles: BI.SummaryTableHelper.getHeaderStyles(self.themeColor, self.tableStyle),
                        text: dName,
                        title: dName,
                        tag: BI.UUID()
                    });
                }
            });
        }

        parseHeader(this.crossItems);
    },

    //仅有列表头和指标 l: {s: {c: [{s: [1, 2]}, {s: [3, 4]}], s: [100, 200]}}
    _createItems4OnlyCrossAndTarget: function (data, crossPV) {
        var self = this;
        var l = data.l;
        var items = [];
        BI.each(this.targetIds, function (i, tId) {
            items.push({
                children: [{
                    type: "bi.page_table_cell",
                    text: BI.Utils.getDimensionNameByID(tId),
                    title: BI.Utils.getDimensionNameByID(tId),
                    styles: BI.SummaryTableHelper.getBodyStyles(self.themeColor, self.tableStyle, i)
                }]
            });
        });
        createItems(items, l.s, {cIndex: 0});
        return items;

        function createItems(items, data, indexOb) {
            var s = data.s, c = data.c;
            if (BI.isNotEmptyArray(c)) {
                BI.each(c, function (i, child) {
                    if (BI.isNotNull(child.s) && BI.isNotNull(child.c)) {
                        createItems(items, child, indexOb);
                    } else if (BI.isNotNull(child.s)) {
                        BI.each(child.s, function (j, sum) {
                            if (BI.isNull(items[j].children[0].values)) {
                                items[j].children[0].values = [];
                            }
                            items[j].children[0].values.push({
                                type: "bi.target_body_normal_cell",
                                text: sum,
                                styles: BI.SummaryTableHelper.getBodyStyles(self.themeColor, self.tableStyle, j),
                                dId: self.targetIds[j],
                                clicked: crossPV[indexOb.cIndex]
                            });
                        });
                        indexOb.cIndex++;
                    }
                });
            }
            if (self.showColTotal) {
                BI.each(s, function (j, sum) {
                    if (BI.isNull(items[j].children[0].values)) {
                        items[j].children[0].values = [];
                    }
                    items[j].children[0].values.push({
                        type: "bi.target_body_normal_cell",
                        text: sum,
                        styles: BI.SummaryTableHelper.getBodyStyles(self.themeColor, self.tableStyle, j),
                        dId: self.targetIds[j],
                        clicked: crossPV[indexOb.cIndex]
                    });
                });
                indexOb.cIndex++;
            }
        }
    },

    /**
     * 初始化 crossItemsSum
     */
    _initCrossItemsSum: function (currentLayer, sums, crossItemsSums) {
        var self = this;
        currentLayer++;
        BI.each(sums, function (i, v) {
            if (BI.isNotNull(v) && BI.isNotNull(v.c)) {
                self._initCrossItemsSum(currentLayer, v.c, crossItemsSums);
            }
            BI.isNull(crossItemsSums[currentLayer]) && (crossItemsSums[currentLayer] = []);
            crossItemsSums[currentLayer].push(BI.isNotNull(v.s));
        });
    },

    //仅有列表头的交叉表
    _createCrossHeader4OnlyCross: function () {
        var self = this;
        BI.each(this.crossDimIds, function (i, dId) {
            if (BI.isNotNull(dId)) {
                self.crossHeader.push({
                    type: "bi.normal_header_cell",
                    dId: dId,
                    text: BI.Utils.getDimensionNameByID(dId),
                    styles: BI.SummaryTableHelper.getHeaderStyles(self.themeColor, self.tableStyle),
                    sortFilterChange: function (v) {
                        self.resetETree();
                        self.pageOperator = BICst.TABLE_PAGE_OPERATOR.REFRESH;
                        self.headerOperatorCallback(v, dId);
                    }
                });
            }
        });
    },

    _isOnlyCrossAndTarget: function () {
        return this.dimIds.length === 0 &&
            this.crossDimIds.length > 0 &&
            this.targetIds.length > 0;
    },

    _createCrossItems4OnlyCross: function () {
        //交叉表items
        var crossItem = {
            children: this._createCrossPartItems(this.data.c, 0)
        };
        this.crossItems = [crossItem];
    },

    _setOtherCrossAttrs: function () {
        var self = this;
        //冻结列
        this.freezeCols = [];
        //合并列，列大小
        var cSize = [];
        BI.each(this.dimIds, function (i, id) {
            self.mergeCols.push(i);
            self.freezeCols.push(i);
        });
        BI.each(this.header, function (i, id) {
            cSize.push("");
        });
        if (this._isOnlyCrossAndTarget()) {
            var values = this.items[0].children[0].values;
            cSize = BI.makeArray(BI.isNotNull(values) ? values.length + 1 : 1, "");
        }
        if (this.columnSize.length !== cSize.length) {
            //重置列宽
            this.columnSize = [];
            BI.each(cSize, function (i, id) {
                self.columnSize.push("");
            });
        }
    },

    _setOtherAttrs4OnlyCross: function () {
        var self = this;
        this.columnSize = [""];
        this.freezeCols = [];
        this.mergeCols = [0];
        function parseSizeOfCrossItems(items) {
            BI.each(items, function (i, item) {
                if (BI.isNotNull(item.children)) {
                    parseSizeOfCrossItems(item.children);
                } else {
                    self.columnSize.push("");
                }
            });
        }

        parseSizeOfCrossItems(this.crossItems);

    },

    //从分组表样式的数据获取交叉表数据样式
    getTopOfCrossByGroupData: function (c) {
        var self = this;
        var newC = [];
        BI.each(c, function (idx, child) {
            var obj = {};
            if (BI.has(child, "c")) {
                obj.c = self.getTopOfCrossByGroupData(child.c);
                if (BI.has(child, "n")) {
                    obj.n = child.n;
                }
                newC.push(obj);
                return;
            }
            if (BI.has(child, "n")) {
                newC.push({
                    c: BI.map(self.targetIds, function (id, targetId) {
                        return {"n": targetId};
                    }),
                    n: child.n
                });
                return newC;
            }
        });
        return newC;
    },

    createTableAttrs: function () {
        var self = this;
        this.headerOperatorCallback = arguments[0];
        this.expanderCallback = arguments[1];

        this._resetPartAttrs();
        this._refreshDimsInfo();

        //仅有列表头的时候(有指标) 修正数据
        if (this.dimIds.length === 0 &&
            this.crossDimIds.length > 0 &&
            this.targetIds.length > 0) {
            var clonedData = BI.deepClone(this.data);
            this.data.t = {c: this.getTopOfCrossByGroupData(clonedData.c)};
            this.data.l = {s: clonedData};
        }

        //正常交叉表
        if (BI.isNotNull(this.data) && BI.isNotNull(this.data.t)) {
            this._createCrossTableItems();
            this._createCrossTableHeader();
            this._setOtherCrossAttrs();
            return;
        }
        //仅有列表头的时候（无指标）
        if (this.dimIds.length === 0 &&
            this.crossDimIds.length > 0 &&
            this.targetIds.length === 0) {
            this._createCrossHeader4OnlyCross();
            this._createCrossItems4OnlyCross();
            this._setOtherAttrs4OnlyCross();
            return;
        }

        //无列表头
        this._createTableHeader();
        this._createTableItems();
        this._setOtherAttrs();

    }
});