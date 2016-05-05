package com.fr.bi.cal.analyze.report.report.widget.tree;

import com.finebi.cube.api.ICubeColumnIndexReader;
import com.finebi.cube.api.ICubeTableService;
import com.fr.bi.cal.analyze.executor.paging.Paging;
import com.fr.bi.cal.analyze.executor.tree.TreeExecutor;
import com.fr.bi.cal.analyze.report.report.widget.TreeWidget;
import com.fr.bi.cal.analyze.session.BISession;
import com.fr.bi.conf.report.widget.field.dimension.BIDimension;
import com.fr.bi.stable.constant.BIReportConstant;
import com.fr.bi.stable.engine.index.key.IndexKey;
import com.fr.bi.stable.gvi.GroupValueIndex;
import com.fr.bi.stable.gvi.RoaringGroupValueIndex;
import com.fr.bi.stable.gvi.traversal.SingleRowTraversalAction;
import com.fr.bi.stable.relation.BITableSourceRelation;
import com.fr.bi.stable.report.result.DimensionCalculator;
import com.fr.bi.stable.utils.code.BILogger;
import com.fr.json.JSONException;
import com.fr.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Created by roy on 16/4/21.
 */
public class AbstractTreeNodeExecutor extends TreeExecutor {
    protected int floors;
    protected String selectedValuesString;

    public AbstractTreeNodeExecutor(TreeWidget widget, Paging paging, BISession session) {
        super(widget, paging, session);
    }


    public void parseJSON(JSONObject jo) throws JSONException {
        if (jo.has("floors")) {
            floors = jo.getInt("floors");
        }
        if (jo.has("selected_values")) {
            selectedValuesString = jo.getString("selected_values");
        }
    }


    protected List<String> createData(String[] parentValues, int times) throws JSONException {
        List<String> dataList = new ArrayList<String>();
        BIDimension[] rowDimension = widget.getViewDimensions();
        DimensionCalculator[] row = new DimensionCalculator[widget.getViewDimensions().length];
        for (int i = 0; i < widget.getViewDimensions().length; i++) {
            row[i] = rowDimension[i].createCalculator(rowDimension[i].getStatisticElement(), new ArrayList<BITableSourceRelation>());
        }
        GroupValueIndex gvi = widget.createFilterGVI(row, row[0].getField().getTableBelongTo(), session.getLoader(), session.getUserId()).AND(session.createFilterGvi(row[0].getField().getTableBelongTo()));
        if (parentValues.length == 0) {
            ICubeTableService ti = getLoader().getTableIndex(target);
            BIDimension dimension = rowDimension[0];
            ICubeColumnIndexReader dataReader = ti.loadGroup(new IndexKey(dimension.createColumnKey().getFieldName()));
            Iterator<Map.Entry> it = dataReader.iterator();
            if (times == -1) {
                while (it.hasNext()) {
                    Map.Entry e = it.next();
                    if (!gvi.AND((GroupValueIndex) e.getValue()).isAllEmpty()) {
                        dataList.add(e.getKey().toString());
                    }
                }
                return dataList;
            }
            if ((times - 1) * BIReportConstant.TREE.TREE_ITEM_COUNT_PER_PAGE < dataReader.sizeOfGroup()) {
                int start = (times - 1) * BIReportConstant.TREE.TREE_ITEM_COUNT_PER_PAGE;
                for (int i = start; i < start + BIReportConstant.TREE.TREE_ITEM_COUNT_PER_PAGE && i < dataReader.sizeOfGroup(); i++) {
                    Object[] groupValue = new Object[1];
                    groupValue[0] = dataReader.getGroupValue(i);
                    if (!gvi.AND(dataReader.getGroupIndex(groupValue)[0]).isAllEmpty()) {
                        dataList.add(dataReader.getGroupValue(i).toString());
                    }
                }
            }
            return dataList;
        } else {
            createGroupValueWithParentValues(dataList, parentValues, gvi, 0, times);
            return dataList;
        }
    }


    private void createGroupValueWithParentValues(List<String> dataList, String[] parentValues, GroupValueIndex filterGvi, int floors, int times) {
        if (floors == parentValues.length) {
            BIDimension dimension = widget.getViewDimensions()[floors];
            ICubeTableService ti = getLoader().getTableIndex(dimension.createTableKey());
            ICubeColumnIndexReader dataReader = ti.loadGroup(new IndexKey(dimension.createColumnKey().getFieldName()));
            if (times == -1) {
                Iterator<Map.Entry> it = dataReader.iterator();
                while (it.hasNext()) {
                    Map.Entry e = it.next();
                    if (!filterGvi.AND((GroupValueIndex) e.getValue()).isAllEmpty()) {
                        dataList.add(e.getKey().toString());
                    }
                }
            }
            if (times > 0 && (times - 1) * BIReportConstant.TREE.TREE_ITEM_COUNT_PER_PAGE < dataReader.sizeOfGroup()) {
                int start = (times - 1) * BIReportConstant.TREE.TREE_ITEM_COUNT_PER_PAGE;
                for (int i = start; i < dataReader.sizeOfGroup(); i++) {
                    Object[] rowValue = new Object[1];
                    rowValue[0] = dataReader.getGroupValue(i);
                    if (!filterGvi.AND(dataReader.getGroupIndex(rowValue)[0]).isAllEmpty()) {
                        dataList.add(dataReader.getGroupValue(i).toString());
                    }
                }
            }
            ti.clear();
        }
        if (floors < parentValues.length) {
            String[] groupValue = new String[1];
            groupValue[0] = parentValues[floors];
            BIDimension dimension = widget.getViewDimensions()[floors];
            ICubeTableService ti = getLoader().getTableIndex(dimension.createTableKey());
            ICubeColumnIndexReader dataReader = ti.loadGroup(new IndexKey(dimension.createColumnKey().getFieldName()), widget.getRelationList(dimension));
            GroupValueIndex gvi = dataReader.getGroupIndex(groupValue)[0].AND(filterGvi);
            ti.clear();
            createGroupValueWithParentValues(dataList, parentValues, gvi, floors + 1, times);
        }
    }

}
