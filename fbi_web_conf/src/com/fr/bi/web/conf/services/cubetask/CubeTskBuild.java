package com.fr.bi.web.conf.services.cubetask;

import com.finebi.cube.conf.BICubeManagerProvider;
import com.finebi.cube.conf.CubeBuildStuff;
import com.finebi.cube.conf.CubeGenerationManager;
import com.fr.bi.base.BIUser;
import com.fr.bi.cal.generate.BuildCubeTask;

/**
 * Created by wuk on 16/5/30.
 */
public class CubeTskBuild {

    private static BICubeManagerProvider cubeManager= CubeGenerationManager.getCubeManager();

    public static void CubeBuild(long userId,CubeBuildStuff cubeBuildStuff){
        cubeManager.addTask(new BuildCubeTask(new BIUser(userId),cubeBuildStuff),userId);
    }
}
