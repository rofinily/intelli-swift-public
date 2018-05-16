package com.fr.swift.query.filter.detail.impl;

import com.fr.swift.bitmap.ImmutableBitMap;
import com.fr.swift.bitmap.impl.BitMapOrHelper;
import com.fr.swift.query.filter.detail.DetailFilter;
import com.fr.swift.query.filter.info.FilterInfo;
import com.fr.swift.result.SwiftNode;
import com.fr.swift.segment.Segment;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Lyon on 2018/3/16.
 */
public class GeneralOrFilter implements DetailFilter {

    private List<DetailFilter> filters;
    private Segment segment;

    public GeneralOrFilter(List<FilterInfo> filterInfoList, Segment segment) {
        this.segment = segment;
        this.filters = init(filterInfoList);
    }

    private List<DetailFilter> init(List<FilterInfo> filterInfoList) {
        List<DetailFilter> detailFilters = new ArrayList<DetailFilter>();
        if (filterInfoList.size() == 0) {
            detailFilters.add(new AllShowDetailFilter(segment));
            return detailFilters;
        }
        for (FilterInfo filterInfo : filterInfoList) {
            detailFilters.add(filterInfo.createDetailFilter(segment));
        }
        return detailFilters;
    }

    @Override
    public ImmutableBitMap createFilterIndex() {
        final BitMapOrHelper bitMapOrHelper = new BitMapOrHelper();
        for (DetailFilter filter : filters) {
            bitMapOrHelper.add(filter.createFilterIndex());
        }
        return bitMapOrHelper.compute();
    }

    @Override
    public boolean matches(SwiftNode node, int targetIndex) {
        for (DetailFilter filter : filters) {
            if (filter.matches(node, targetIndex)) {
                return true;
            }
        }
        return false;
    }
}
