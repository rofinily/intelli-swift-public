package com.finebi.cube.data.input;

import com.finebi.cube.exception.BIResourceInvalidException;

/**
 * This class created on 2016/3/11.
 *
 * @author Connery
 * @since 4.0
 */
public interface ICubeByteArrayReader extends ICubeReader, ICubeObjectReader<byte[]> {
    byte getFirstByte(int row) throws BIResourceInvalidException;
}
