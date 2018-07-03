package com.fr.swift.query.info.element.dimension;

import com.fr.swift.query.group.Group;
import com.fr.swift.query.sort.Sort;
import com.fr.swift.segment.column.ColumnKey;
import com.fr.swift.source.SourceKey;

/**
 * Created by pony on 2017/12/22.
 */
public class DetailDimension extends AbstractDimension {
    public DetailDimension(int index, SourceKey sourceKey, ColumnKey columnKey, Group group, Sort sort) {
        super(index, sourceKey, columnKey, group, sort);
    }

    @Override
    public DimensionType getDimensionType() {
        return DimensionType.DETAIL;
    }
}
