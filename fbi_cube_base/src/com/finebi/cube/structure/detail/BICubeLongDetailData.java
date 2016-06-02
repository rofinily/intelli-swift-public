package com.finebi.cube.structure.detail;

import com.finebi.cube.data.ICubeResourceDiscovery;
import com.finebi.cube.location.ICubeResourceLocation;
import com.fr.bi.stable.constant.DBConstant;

/**
 * This class created on 2016/3/28.
 *
 * @author Connery
 * @since 4.0
 */
public class BICubeLongDetailData extends BICubeDetailData<Long> {
    public BICubeLongDetailData(ICubeResourceDiscovery discovery, ICubeResourceLocation superLocation) {
        super(discovery, superLocation);
    }

    @Override
    protected ICubeResourceLocation setDetailType() {
        return currentLocation.setLongTypeWrapper();
    }

    @Override
    public int getClassType() {
        return DBConstant.CLASS.LONG;
    }
}
