package com.fr.swift.segment;

import com.fr.swift.segment.impl.SegmentDestinationImpl;
import com.fr.swift.service.SwiftService;
import com.fr.third.fasterxml.jackson.databind.annotation.JsonDeserialize;

import java.io.Serializable;
import java.net.URI;
import java.util.List;

/**
 * @author yee
 * @date 2018/6/13
 */
@JsonDeserialize(as = SegmentDestinationImpl.class)
public interface SegmentDestination extends Serializable, Comparable<SegmentDestination> {
    boolean isRemote();

    Class<? extends SwiftService> getServiceClass();

    String getMethodName();

    String getAddress();

    int getOrder();

    String getClusterId();

    URI getUri();

    List<String> getSpareNodes();
}
