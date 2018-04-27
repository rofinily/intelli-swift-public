package com.fr.swift.adaptor.log;

import com.fr.general.DataList;
import com.fr.general.LogOperator;
import com.fr.stable.query.condition.QueryCondition;
import com.fr.swift.db.Database;
import com.fr.swift.db.Table;
import com.fr.swift.db.impl.SwiftDatabase;
import com.fr.swift.source.SourceKey;
import com.fr.swift.source.SwiftMetaData;
import com.fr.swift.source.SwiftResultSet;

import java.sql.SQLException;
import java.util.Collections;
import java.util.List;

/**
 * @author anchore
 * @date 2018/4/26
 */
public class LogOperatorImpl implements LogOperator {
    private Database db = SwiftDatabase.getInstance();

    private static final int USE_IMPORT_THRESHOLD = 100000;

    @Override
    public <T> DataList<T> find(Class<T> aClass, QueryCondition queryCondition) {
        return null;
    }

    @Override
    public <T> DataList<T> find(Class<T> aClass, QueryCondition queryCondition, String s) {
        return null;
    }

    @Override
    public void recordInfo(Object o) throws Exception {
        if (o == null) {
            return;
        }
        Table table = db.getTable(new SourceKey(SwiftMetaAdaptor.getTableName(o.getClass())));
        table.insert(new LogRowSet(table.getMeta(), Collections.singletonList(o), new SwiftRowAdaptor(o.getClass())));
    }

    @Override
    public void recordInfo(List<Object> list) throws Exception {
        if (list == null || list.isEmpty()) {
            return;
        }
        Object first = list.get(0);
        Table table = db.getTable(new SourceKey(SwiftMetaAdaptor.getTableName(first.getClass())));
        SwiftResultSet rowSet = new LogRowSet(table.getMeta(), list, new SwiftRowAdaptor(first.getClass()));
        if (list.size() < USE_IMPORT_THRESHOLD) {
            table.insert(rowSet);
        } else {
            table.importFrom(rowSet);
        }
    }

    @Override
    public void initTables(List<Class> list) throws SQLException {
        for (Class table : list) {
            SwiftMetaData meta = SwiftMetaAdaptor.adapt(table);
            db.createTable(new SourceKey(meta.getTableName()), meta);
        }
    }

    private static final LogOperator INSTANCE = new LogOperatorImpl();

    private LogOperatorImpl() {
    }

    public static LogOperator getInstance() {
        return INSTANCE;
    }
}