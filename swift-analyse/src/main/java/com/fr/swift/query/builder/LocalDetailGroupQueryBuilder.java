package com.fr.swift.query.builder;

import com.fr.swift.compare.Comparators;
import com.fr.swift.context.SwiftContext;
import com.fr.swift.db.impl.SwiftDatabase;
import com.fr.swift.log.SwiftLoggers;
import com.fr.swift.query.filter.FilterBuilder;
import com.fr.swift.query.filter.SwiftDetailFilterType;
import com.fr.swift.query.filter.info.FilterInfo;
import com.fr.swift.query.filter.info.GeneralFilterInfo;
import com.fr.swift.query.filter.info.SwiftDetailFilterInfo;
import com.fr.swift.query.group.info.IndexInfo;
import com.fr.swift.query.info.detail.DetailQueryInfo;
import com.fr.swift.query.info.element.dimension.Dimension;
import com.fr.swift.query.query.Query;
import com.fr.swift.query.result.detail.SortDetailResultQuery;
import com.fr.swift.query.segment.detail.SortDetailSegmentQuery;
import com.fr.swift.query.sort.Sort;
import com.fr.swift.query.sort.SortType;
import com.fr.swift.result.DetailResultSet;
import com.fr.swift.segment.Segment;
import com.fr.swift.segment.SwiftSegmentManager;
import com.fr.swift.segment.column.Column;
import com.fr.swift.source.ColumnTypeConstants;
import com.fr.swift.source.ColumnTypeUtils;
import com.fr.swift.source.SourceKey;
import com.fr.swift.source.SwiftMetaDataColumn;
import com.fr.swift.structure.Pair;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Created by pony on 2017/12/14.
 */
public class LocalDetailGroupQueryBuilder implements LocalDetailQueryBuilder {

    private final SwiftSegmentManager localSegmentProvider = SwiftContext.get().getBean("localSegmentProvider", SwiftSegmentManager.class);

    protected LocalDetailGroupQueryBuilder() {
    }

    @Override
    public Query<DetailResultSet> buildLocalQuery(DetailQueryInfo info) {
        List<Query<DetailResultSet>> queries = new ArrayList<Query<DetailResultSet>>();
        List<Segment> segments = localSegmentProvider.getSegmentsByIds(info.getTable(), info.getQuerySegment());
        List<Dimension> dimensions = info.getDimensions();
        for (Segment segment : segments) {
            List<FilterInfo> filterInfos = new ArrayList<FilterInfo>();
            filterInfos.add(new SwiftDetailFilterInfo<Object>(null, null, SwiftDetailFilterType.ALL_SHOW));
            List<Pair<Column, IndexInfo>> columns = AbstractLocalGroupQueryBuilder.getDimensionSegments(segment, dimensions);
            if (info.getFilterInfo() != null) {
                filterInfos.add(info.getFilterInfo());
            }
            List<Sort> sorts = info.getSorts();
            queries.add(new SortDetailSegmentQuery(info.getFetchSize(), columns,
                    FilterBuilder.buildDetailFilter(segment, new GeneralFilterInfo(filterInfos, GeneralFilterInfo.AND)), sorts));
        }
        return new SortDetailResultQuery(info.getFetchSize(), queries, getComparators(info.getTable(), info.getSorts()));
    }

    @Override
    public Query<DetailResultSet> buildResultQuery(List<Query<DetailResultSet>> queries, DetailQueryInfo info) {
        return new SortDetailResultQuery(info.getFetchSize(), queries, info.getTargets(), getComparators(info.getTable(), info.getSorts()));
    }

    private static List<Pair<Sort, Comparator>> getComparators(SourceKey table, List<Sort> sorts) {
        List<Pair<Sort, Comparator>> comparators = new ArrayList<Pair<Sort, Comparator>>();
        for (Sort sort : sorts) {
            comparators.add(Pair.of(sort, getComparator(sort.getSortType(), table, sort.getColumnKey().getName())));
        }
        return comparators;
    }

    private static Comparator getComparator(SortType sortType, SourceKey table, String columnName) {
        ColumnTypeConstants.ClassType type = getClassType(table, columnName);
        switch (type) {
            case LONG:
            case INTEGER:
            case DATE:
                return sortType == SortType.ASC ? Comparators.<Long>asc() : Comparators.<Long>desc();
            case DOUBLE:
                return sortType == SortType.ASC ? Comparators.<Double>asc() : Comparators.<Double>desc();
            default:
                return sortType == SortType.ASC ? Comparators.<String>asc() : Comparators.<String>desc();
        }
    }

    private static ColumnTypeConstants.ClassType getClassType(SourceKey table, String columnName) {
        SwiftMetaDataColumn column = null;
        try {
            column = SwiftDatabase.getInstance().getTable(table).getMetadata().getColumn(columnName);
        } catch (SQLException e) {
            SwiftLoggers.getLogger().error("failed to read metadata of table: " + table.toString());
        }
        return ColumnTypeUtils.getClassType(column);
    }
}
