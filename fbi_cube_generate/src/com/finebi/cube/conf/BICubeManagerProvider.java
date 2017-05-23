package com.finebi.cube.conf;


import com.finebi.cube.impl.conf.CubeBuildStuffComplete;
import com.fr.bi.stable.constant.Status;
import com.fr.bi.stable.engine.CubeTask;

import java.util.Iterator;
import java.util.List;
import java.util.Set;

/**
 * This class created on 2016/5/23.
 *
 * @author Connery
 * @since 4.0
 */
public interface BICubeManagerProvider {

    String XML_TAG = "BICubeManager";

    /**
     * 环境改变
     */
    void envChanged();

    /**
     * 重置cube生成时间
     */
    void resetCubeGenerationHour(long userId);

    /**
     * 增加任务
     *
     * @param task 任务
     * @return 是否增加
     */
    boolean addTask(CubeTask task, long userId);

    CubeBuildStuffComplete getGeneratingObject(long userId);

    void removeTask(String id, long userId);

    boolean hasAllTask(long userId);

    boolean hasCheckTask(long userId);

    boolean hasTask(CubeTask task, long userId);

    boolean hasTask(long useId);

    /**
     * 获取所有用户是否有cube生成任务
     *
     * @return
     */
    boolean hasTask();

    boolean hasWaitingCheckTask(long useId);

    Iterator<CubeTask> getWaitingTaskIterator(long userId);

    CubeTask getGeneratedTask(long userId);

    CubeTask getGeneratingTask(long userId);

    boolean checkCubeStatus(long userId);

    void setStatus(long userId, Status status);

    boolean cubeTaskBuild(long userId, String baseTableSourceId, int updateType);

    Set<String> getCubeGeneratingTableSourceIds(long userId);

    Set<String> getCubeWaiting2GenerateTableSourceIds(long userId);

    boolean isCubeBuilding();

    void addCustomTableTask2Queue(long userId, List<String> baseTableSourceIds,
                                  List<Integer> updateTypes) throws InterruptedException;

    CubeTask buildCompleteStuff(long userId);

    CubeTask buildStaff(long userId);

    Set<String> getAllCubeWaiting2GenerateTableSouceIds(long userId);

    List<CubeBuildStuff> buildCustomTable(long userId, List<String> baseTableSourceIds, List<Integer> updateTypes);

    CubeTask getUpdatingTask(long userId);
}
