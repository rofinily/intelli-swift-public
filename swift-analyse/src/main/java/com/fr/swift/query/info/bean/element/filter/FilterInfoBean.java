package com.fr.swift.query.info.bean.element.filter;

import com.fr.swift.query.filter.SwiftDetailFilterType;
import com.fr.swift.query.info.bean.element.filter.impl.AndFilterBean;
import com.fr.swift.query.info.bean.element.filter.impl.InFilterBean;
import com.fr.swift.query.info.bean.element.filter.impl.NFilterBean;
import com.fr.swift.query.info.bean.element.filter.impl.NotFilterBean;
import com.fr.swift.query.info.bean.element.filter.impl.NullfilterBean;
import com.fr.swift.query.info.bean.element.filter.impl.NumberInRangeFilterBean;
import com.fr.swift.query.info.bean.element.filter.impl.OrFilterBean;
import com.fr.swift.query.info.bean.element.filter.impl.StringOneValueFilterBean;
import com.fr.third.fasterxml.jackson.annotation.JsonSubTypes;
import com.fr.third.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * @author yee
 * @date 2018/6/22
 */
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "type",
        defaultImpl = SwiftDetailFilterType.class,
        visible = true)
@JsonSubTypes({
        @JsonSubTypes.Type(value = InFilterBean.class, name = "IN"),
        @JsonSubTypes.Type(value = StringOneValueFilterBean.class, name = "STRING_LIKE"),
        @JsonSubTypes.Type(value = StringOneValueFilterBean.class, name = "STRING_ENDS_WITH"),
        @JsonSubTypes.Type(value = StringOneValueFilterBean.class, name = "STRING_STARTS_WITH"),
        @JsonSubTypes.Type(value = NumberInRangeFilterBean.class, name = "NUMBER_IN_RANGE"),
        @JsonSubTypes.Type(value = NFilterBean.class, name = "BOTTOM_N"),
        @JsonSubTypes.Type(value = NFilterBean.class, name = "TOP_N"),
        @JsonSubTypes.Type(value = NullfilterBean.class, name = "NULL"),
        @JsonSubTypes.Type(value = AndFilterBean.class, name = "AND"),
        @JsonSubTypes.Type(value = OrFilterBean.class, name = "OR"),
        @JsonSubTypes.Type(value = NotFilterBean.class, name = "NOT")
})
public interface FilterInfoBean<T> {

    SwiftDetailFilterType getType();

    void setType(SwiftDetailFilterType type);

    T getFilterValue();

    void setFilterValue(T filterValue);
}
