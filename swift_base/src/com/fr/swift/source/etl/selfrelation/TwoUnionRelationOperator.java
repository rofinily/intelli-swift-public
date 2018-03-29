package com.fr.swift.source.etl.selfrelation;

import com.fr.swift.exception.meta.SwiftMetaDataException;
import com.fr.swift.log.SwiftLogger;
import com.fr.swift.log.SwiftLoggers;
import com.fr.swift.source.MetaDataColumn;
import com.fr.swift.source.SwiftMetaData;
import com.fr.swift.source.SwiftMetaDataColumn;
import com.fr.swift.source.core.CoreField;
import com.fr.swift.source.core.MD5Utils;
import com.fr.swift.source.etl.AbstractOperator;
import com.fr.swift.source.etl.OperatorType;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by Handsome on 2018/1/19 0019 09:59
 */
public class TwoUnionRelationOperator extends AbstractOperator {

    private static final SwiftLogger LOGGER = SwiftLoggers.getLogger(TwoUnionRelationOperator.class);
    @CoreField
    private String idColumnName;
    @CoreField
    private List<String> showColumns = new ArrayList<String>();
    @CoreField
    private LinkedHashMap<String, Integer> columns = new LinkedHashMap<String, Integer>();
    @CoreField
    private int columnType;
    @CoreField
    private String columnName;
    @CoreField
    private String parentIdColumnName;
    @CoreField
    private String[] addedColumns;

    private List<SwiftMetaDataColumn> columnList;

    public TwoUnionRelationOperator(String idColumnName, List<String> showColumns, LinkedHashMap<String, Integer> columns,
                                    int columnType, String columnName, String parentIdColumnName) {
        this.idColumnName = idColumnName;
        this.showColumns = showColumns;
        this.columns = columns;
        this.columnType = columnType;
        this.columnName = columnName;
        this.parentIdColumnName = parentIdColumnName;
    }

    public String getIdColumnName() {
        return idColumnName;
    }

    public List<String> getShowColumns() {
        return showColumns;
    }

    public LinkedHashMap<String, Integer> getColumns() {
        return columns;
    }

    public int getColumnType() {
        return columnType;
    }

    public String getColumnName() {
        return columnName;
    }

    public String getParentIdColumnName() {
        return parentIdColumnName;
    }

    public String[] getAddedName() {
        return addedColumns;
    }

    @Override
    public List<String> getNewAddedName() {
        List<String> addColumnNames = new ArrayList<String>();
        for (SwiftMetaDataColumn column : columnList) {
            if (!showColumns.contains(column.getName())) {
                addColumnNames.add(column.getName());
            }
        }
        return addColumnNames;
    }

    @Override
    public List<SwiftMetaDataColumn> getColumns(SwiftMetaData[] metaDatas) {
        Iterator<Map.Entry<String, Integer>> it;
        columnList = new ArrayList<SwiftMetaDataColumn>();
        for (int i = 0; i < metaDatas.length; i++) {
            SwiftMetaData table = metaDatas[0];
            try {
                int size = table.getColumn(this.idColumnName).getPrecision();
//                for (int j = 0; j < table.getColumnCount(); j++) {
//                    columnList.add(table.getColumn(table.getColumnName(j + 1)));
//                }
                for (String s : this.showColumns) {
                    it = columns.entrySet().iterator();
                    while (it.hasNext()) {
                        Map.Entry<String, Integer> entry = it.next();
                        columnList.add(new MetaDataColumn(s + "-" + entry.getKey(), this.columnType, size,
                                MD5Utils.getMD5String(new String[]{(s + "-" + entry.getKey() + this.columnType)})));
                    }
                }
            } catch (SwiftMetaDataException e) {
                LOGGER.error("getting meta's column information failed", e);
            }

        }
        addedColumns = new String[columnList.size()];
        int index = 0;
        Iterator<SwiftMetaDataColumn> iterator = columnList.iterator();
        while(iterator.hasNext()) {
            SwiftMetaDataColumn temp = iterator.next();
            addedColumns[index ++] = temp.getName();
        }
        return columnList;
    }

    @Override
    public OperatorType getOperatorType() {
        return OperatorType.TWO_UNION_RELATION;
    }
}
