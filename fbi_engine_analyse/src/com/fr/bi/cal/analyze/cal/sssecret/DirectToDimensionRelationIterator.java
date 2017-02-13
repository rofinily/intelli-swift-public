package com.fr.bi.cal.analyze.cal.sssecret;

import com.finebi.cube.api.ICubeColumnIndexReader;
import com.finebi.cube.api.ICubeDataLoader;
import com.fr.bi.stable.data.db.ICubeFieldSource;
import com.fr.bi.stable.data.source.CubeTableSource;
import com.fr.bi.stable.engine.index.key.IndexKey;
import com.fr.bi.stable.gvi.GroupValueIndex;
import com.fr.bi.stable.gvi.traversal.SingleRowTraversalAction;
import com.fr.bi.stable.report.result.DimensionCalculator;

import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

/**
 * Created by 小灰灰 on 2016/12/30.
 */
public class DirectToDimensionRelationIterator implements Iterator<Map.Entry<Object, GroupValueIndex>> {
    private Iterator<Map.Entry<Object, GroupValueIndex>> iterator;
    private DimensionCalculator calculator;
    private ICubeDataLoader loader;


    protected DirectToDimensionRelationIterator(Iterator<Map.Entry<Object, GroupValueIndex>> iterator, DimensionCalculator calculator, ICubeDataLoader loader) {
        this.iterator = iterator;
        this.calculator = calculator;
        this.loader = loader;
    }

    @Override
    public boolean hasNext() {
        return iterator.hasNext();
    }

    @Override
    public Map.Entry<Object, GroupValueIndex> next() {
        Map.Entry<Object, GroupValueIndex> entry = iterator.next();
        Object keyValue = entry.getKey();
        final GroupValueIndex gvi = entry.getValue();
            //默认第一个位置放的是主表
        CubeTableSource primaryTableSource = calculator.getDirectToDimensionRelationList().get(0).getPrimaryTable();
        ICubeFieldSource primaryFieldSource = calculator.getDirectToDimensionRelationList().get(0).getPrimaryField();
        final Set keyValueSet = new LinkedHashSet();
        final ICubeColumnIndexReader dimensionGetter = loader.getTableIndex(calculator.getField().getTableBelongTo().getTableSource()).loadGroup(calculator.createKey());
        ICubeColumnIndexReader primaryTableGetter = loader.getTableIndex(primaryTableSource).loadGroup(new IndexKey(primaryFieldSource.getFieldName()), calculator.getDirectToDimensionRelationList());
        primaryTableGetter.getGroupIndex(new Object[]{keyValue})[0].Traversal(new SingleRowTraversalAction() {
            @Override
            public void actionPerformed(int row) {
                Object ob = dimensionGetter.getOriginalValue(row);
                if (ob != null){
                    keyValueSet.add(ob);
                }
            }
        });
        StringBuilder sb = new StringBuilder();
        Iterator it = keyValueSet.iterator();
        while (it.hasNext()){
            sb.append(it.next());
            sb.append(",");
        }
        final int size = keyValueSet.size();
        if (size > 0){
            sb.deleteCharAt(sb.length() - 1);
        }

        final String finalKeyValueString = sb.toString();
        return new Map.Entry<Object, GroupValueIndex>() {
            @Override
            public Object getKey() {
                return finalKeyValueString;
            }

            @Override
            public GroupValueIndex getValue() {
                return size > 0 ? gvi : null;
            }

            @Override
            public GroupValueIndex setValue(GroupValueIndex value) {
                return null;
            }
        };
    }

    @Override
    public void remove() {
        iterator.remove();
    }
}
