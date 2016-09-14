package com.finebi.cube.structure;

import com.finebi.cube.data.ICubeResourceDiscovery;
import com.finebi.cube.exception.BICubeIndexException;
import com.finebi.cube.exception.BIResourceInvalidException;
import com.finebi.cube.location.ICubeResourceLocation;
import com.finebi.cube.structure.property.BICubeReverseRelationService;
import com.finebi.cube.structure.property.BICubeVersion;
import com.fr.bi.stable.gvi.GroupValueIndex;

/**
 * This class created on 2016/3/3.
 *
 * @author Connery
 * @since 4.0
 */
public class BICubeRelationEntity implements ICubeRelationEntityService {


    private ICubeIndexDataService indexDataService;
    private ICubeResourceDiscovery discovery;
    private ICubeReverseRelationService reverseRelationService;
    private BICubeVersion version;

    public BICubeRelationEntity(ICubeResourceDiscovery discovery, ICubeResourceLocation cubeResourceLocation) {
        this.discovery = discovery;
        indexDataService = new BICubeIndexData(this.discovery, cubeResourceLocation);
        reverseRelationService = new BICubeReverseRelationService(cubeResourceLocation, discovery);
        version = new BICubeVersion(cubeResourceLocation, discovery);
    }

    public BICubeRelationEntity(ICubeIndexDataService indexDataService) {
        this.indexDataService = indexDataService;
    }

    public void setIndexDataService(ICubeIndexDataService indexDataService) {
        this.indexDataService = indexDataService;
    }

    @Override
    public void addRelationIndex(int position, GroupValueIndex groupValueIndex) {
        indexDataService.addIndex(position, groupValueIndex);
    }


    @Override
    public void addRelationNULLIndex(int position, GroupValueIndex groupValueIndex) {
        indexDataService.addNULLIndex(position, groupValueIndex);
    }

    @Override
    public void addReverseIndex(int row, Integer position) {
        reverseRelationService.addReverseRow(row, position);
    }


    @Override
    public GroupValueIndex getBitmapIndex(int position) throws BICubeIndexException {
        return indexDataService.getBitmapIndex(position);

    }

    @Override
    public GroupValueIndex getNULLIndex(int position) throws BICubeIndexException {
        return indexDataService.getNULLIndex(position);
    }

    @Override
    public void clear() {
        indexDataService.clear();
        reverseRelationService.clear();
        version.clear();
    }

    @Override
    public void forceReleaseWriter() {
        indexDataService.forceReleaseWriter();
        reverseRelationService.forceReleaseWriter();
        version.forceReleaseWriter();
    }

    @Override
    public boolean isEmpty() {
        return indexDataService.isEmpty();
    }

    public long getCubeVersion() {
        return version.getCubeVersion();
    }

    @Override
    public void addVersion(long version) {
        this.version.addVersion(version);
        this.version.forceRelease();
    }

    @Override
    public ICubeResourceLocation getResourceLocation() {
        return indexDataService.getResourceLocation();
    }

    @Override
    public Boolean isVersionAvailable() {
        return version.isVersionAvailable();
    }

    @Override
    public int getReverseIndex(int row) throws BIResourceInvalidException {
        return reverseRelationService.getReverseRow(row);
    }
}

