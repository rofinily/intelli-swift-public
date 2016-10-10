package com.finebi.cube.data.disk;

import com.finebi.cube.data.ICubePrimitiveResourceDiscovery;
import com.finebi.cube.data.disk.writer.primitive.BIPrimitiveNIOWriterManager;
import com.finebi.cube.data.input.primitive.ICubePrimitiveReader;
import com.finebi.cube.data.output.primitive.ICubePrimitiveWriter;
import com.finebi.cube.exception.BIBuildReaderException;
import com.finebi.cube.exception.BIBuildWriterException;
import com.finebi.cube.exception.IllegalCubeResourceLocationException;
import com.finebi.cube.location.ICubeResourceLocation;
<<<<<<< HEAD
import com.fr.bi.stable.utils.code.BILogger;
=======
import com.fr.bi.common.factory.BIFactoryHelper;
import com.finebi.cube.common.log.BILoggerFactory;
>>>>>>> 130332cfbf32c97957d64e17b6c040b49db7432e
import com.fr.bi.stable.utils.program.BINonValueUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * This class created on 2016/3/10.
 *
 * @author Connery
 * @since 4.0
 */

public class BICubeDiskPrimitiveDiscovery implements ICubePrimitiveResourceDiscovery {

    private static BICubeDiskPrimitiveDiscovery instance;
    private Map<ICubeResourceLocation, ResourceLock> resourceLockMap;
    private Map<String, NIOResourceManager> fileResourceMap;
    private boolean releasingResource = false;

    public static synchronized BICubeDiskPrimitiveDiscovery getInstance() {
        if (instance != null) {
            return instance;
        } else {
            synchronized (BIPrimitiveNIOWriterManager.class) {
                if (instance == null) {
                    instance = new BICubeDiskPrimitiveDiscovery();
                }
                return instance;
            }
        }
    }

    private BICubeDiskPrimitiveDiscovery() {
        resourceLockMap = new ConcurrentHashMap<ICubeResourceLocation, ResourceLock>();
        fileResourceMap = new ConcurrentHashMap<String, NIOResourceManager>();
    }

    @Override
    public ICubePrimitiveReader getCubeReader(ICubeResourceLocation resourceLocation) throws IllegalCubeResourceLocationException, BIBuildReaderException {
        String filePath = resourceLocation.getAbsolutePath();
        synchronized (this) {
            if (releasingResource) {
                throw new RuntimeException("Current can't get the resource reader");
            }
            if (!fileResourceMap.containsKey(filePath)) {
                NIOResourceManager nioResourceManager = new NIOResourceManager();
                fileResourceMap.put(filePath, nioResourceManager);
            }
            NIOResourceManager nioReaderManager = fileResourceMap.get(filePath);
            try {
                nioReaderManager.getReadWriteLock().readLock().lock();
                return nioReaderManager.getCubeReader(resourceLocation);
            }catch (Exception e){
                throw BINonValueUtils.beyondControl(e);
            }finally {
                nioReaderManager.getReadWriteLock().readLock().unlock();
            }

        }
    }

    @Override
    public ICubePrimitiveWriter getCubeWriter(ICubeResourceLocation resourceLocation) throws IllegalCubeResourceLocationException, BIBuildWriterException {
        String filePath = resourceLocation.getAbsolutePath();
        synchronized (this) {
            if (releasingResource) {
                throw new RuntimeException("Current can't get the resource writer");
            }
            if (!fileResourceMap.containsKey(filePath)) {
                NIOResourceManager nioResourceManager = new NIOResourceManager();
                fileResourceMap.put(filePath, nioResourceManager);
            }
            NIOResourceManager nioWriterManager = fileResourceMap.get(filePath);
            try {
                nioWriterManager.getReadWriteLock().writeLock().lock();
                return nioWriterManager.getCubeWriter(resourceLocation);
            }catch (Exception e){
                throw BINonValueUtils.beyondControl(e);
            }finally {
                nioWriterManager.getReadWriteLock().writeLock().unlock();
            }
        }
    }

    private ResourceLock getLock(ICubeResourceLocation resourceLocation) {
        /**
         * 加强一些
         */
        synchronized (resourceLockMap) {
            if (resourceLockMap.containsKey(resourceLocation)) {
                return resourceLockMap.get(resourceLocation);
            } else {
                if (!resourceLockMap.containsKey(resourceLocation)) {
                    ResourceLock lock = new ResourceLock();
                    resourceLockMap.put(resourceLocation, lock);
                }
                return resourceLockMap.get(resourceLocation);
            }
        }
    }

    public List<ICubeResourceLocation>  getUnReleasedLocation() {
        synchronized (this){
            List<ICubeResourceLocation> locations=new ArrayList<ICubeResourceLocation>();
            try {
//                locations = readerCache.getUnReleasedLocation();
//                locations.addAll(writerCache.getUnReleasedLocation());
                BILogger.getLogger().info("getUnReleasedLocation is not implement");
            } catch (Exception e) {
                BILogger.getLogger().error(e.getMessage(), e);
            }
            return locations;
        }
    }

    private class ResourceLock {

    }

    public void finishRelease() {
        synchronized (this) {
            releasingResource = false;
        }
    }

    public void forceRelease() {
        synchronized (this) {
            releasingResource = true;
            try {
                for (NIOResourceManager nioManager:fileResourceMap.values()){
                    nioManager.forceRelease();
                }
            } catch (Exception e) {
                BILoggerFactory.getLogger().error(e.getMessage(), e);
            } finally {

            }
        }
    }
<<<<<<< HEAD
=======

    public List<ICubeResourceLocation> getUnReleasedLocation(){
        synchronized (this){
            List<ICubeResourceLocation> locations=new ArrayList<ICubeResourceLocation>();
            try {
                locations = readerCache.getUnReleasedLocation();
                locations.addAll(writerCache.getUnReleasedLocation());
            } catch (Exception e) {
                BILoggerFactory.getLogger().error(e.getMessage(), e);
            }
            return locations;
        }
    }
>>>>>>> 130332cfbf32c97957d64e17b6c040b49db7432e
}
