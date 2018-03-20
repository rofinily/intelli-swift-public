package com.fr.swift.source.etl.datediff;

import com.fr.swift.segment.column.impl.DateType;

/**
 * @author anchore
 * @date 2018/3/19
 */
public class HourDiffer implements DateDiffCalculator {
    public static final DateDiffCalculator INSTANCE = new HourDiffer();

    private static final int ONE_HOUR = DateType.MINUTE.radix * DateType.SECOND.radix * DateType.MILLISECOND.radix;

    @Override
    public int get(Long d1, Long d2) {
        if (d1 == null || d2 == null) {
            return 0;
        }
        return (int) ((d1 - d2) / ONE_HOUR);
    }
}