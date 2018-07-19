package com.fr.swift.config.bean;

import com.fr.swift.config.annotation.ConfigField;

/**
 * @author yee
 * @date 2018/6/15
 */
public class HdfsRepositoryConfigBean implements SwiftFileSystemConfig {
    @ConfigField
    private String fsName = "fs.defaultFS";
    @ConfigField
    private String hdfsHost = "127.0.0.1";
    @ConfigField
    private String hdfsPort = "9000";

    public HdfsRepositoryConfigBean(String fsName, String hdfsHost, String hdfsPort) {
        this.fsName = fsName;
        this.hdfsHost = hdfsHost;
        this.hdfsPort = hdfsPort;
    }

    public HdfsRepositoryConfigBean() {
    }

    public String getFsName() {
        return fsName;
    }

    public void setFsName(String fsName) {
        this.fsName = fsName;
    }

    public String getHdfsHost() {
        return hdfsHost;
    }

    public void setHdfsHost(String hdfsHost) {
        this.hdfsHost = hdfsHost;
    }

    public String getHdfsPort() {
        return hdfsPort;
    }

    public void setHdfsPort(String hdfsPort) {
        this.hdfsPort = hdfsPort;
    }

    public String getFullAddress() {
        return String.format("hdfs://%s:%s/", hdfsHost, hdfsPort);
    }

    @Override
    public SwiftFileSystemType getType() {
        return SwiftFileSystemType.HDFS;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        HdfsRepositoryConfigBean that = (HdfsRepositoryConfigBean) o;

        if (hdfsHost != null ? !hdfsHost.equals(that.hdfsHost) : that.hdfsHost != null) {
            return false;
        }
        return hdfsPort != null ? hdfsPort.equals(that.hdfsPort) : that.hdfsPort == null;
    }

    @Override
    public int hashCode() {
        int result = hdfsHost != null ? hdfsHost.hashCode() : 0;
        result = 31 * result + (hdfsPort != null ? hdfsPort.hashCode() : 0);
        return result;
    }
}
