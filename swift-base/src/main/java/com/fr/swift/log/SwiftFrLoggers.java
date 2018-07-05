package com.fr.swift.log;

import com.fr.swift.util.function.Function;

/**
 * @author anchore
 * @date 2018/7/4
 */
public class SwiftFrLoggers implements Function<Void, SwiftLogger> {
    private static final SwiftLogger LOGGER = new SwiftFrLogger();

    @Override
    public SwiftLogger apply(Void p) {
        return LOGGER;
    }
}