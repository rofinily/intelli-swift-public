package com.fr.swift.event.realtime;

import com.fr.swift.event.base.AbstractRealTimeRpcEvent;
import com.fr.swift.segment.SegmentKey;

import java.util.List;

/**
 * @author yee
 * @date 2018/6/8
 */
public class RealTimeMergeRpcEvent extends AbstractRealTimeRpcEvent<List<SegmentKey>> {

    private static final long serialVersionUID = 8404690845632795949L;
    private List<SegmentKey> segmentKeys;


    public RealTimeMergeRpcEvent(List<SegmentKey> segmentKeys) {
        this.segmentKeys = segmentKeys;
    }

    @Override
    public Event subEvent() {
        return Event.MERGE;
    }

    @Override
    public List<SegmentKey> getContent() {
        return segmentKeys;
    }
}
