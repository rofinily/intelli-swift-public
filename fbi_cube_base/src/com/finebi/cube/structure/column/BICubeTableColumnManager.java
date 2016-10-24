package com.finebi.cube.structure.column;

import com.finebi.cube.data.ICubeResourceDiscovery;
import com.finebi.cube.exception.BICubeColumnAbsentException;
import com.finebi.cube.location.ICubeResourceLocation;
import com.finebi.cube.location.ICubeResourceRetrievalService;
import com.finebi.cube.structure.BICubeFieldRelationManager;
import com.finebi.cube.structure.BITableKey;
import com.finebi.cube.structure.ITableKey;
import com.finebi.cube.structure.column.date.*;
import com.fr.bi.stable.constant.DBConstant;
import com.fr.bi.stable.data.db.ICubeFieldSource;
import com.fr.bi.stable.data.source.CubeTableSource;
import com.finebi.cube.common.log.BILoggerFactory;
import com.fr.bi.stable.utils.program.BINonValueUtils;

import java.util.*;

/**
 * This class created on 2016/3/7.
 *
 * @author Connery
 * @since 4.0
 */
public class BICubeTableColumnManager implements ICubeTableColumnManagerService {

    private Map<BIColumnKey, ICubeColumnEntityService> columnKey2ColumnMap;
    private ICubeResourceRetrievalService resourceRetrievalService;
    private ICubeResourceDiscovery discovery;
    private ITableKey tableKey;
    private ITableKey owner;

    public BICubeTableColumnManager(ITableKey tableKey, ICubeResourceRetrievalService resourceRetrievalService, List<ICubeFieldSource> fieldList, ICubeResourceDiscovery discovery) {
        columnKey2ColumnMap = new HashMap<BIColumnKey, ICubeColumnEntityService>();
        this.resourceRetrievalService = resourceRetrievalService;
        this.tableKey = tableKey;
        this.discovery = discovery;
        initialColumn(fieldList, tableKey);
    }

    @Override
    public void setOwner(ITableKey owner) {
        this.owner = owner;
        for (ICubeColumnEntityService columnEntityService : columnKey2ColumnMap.values()) {
            columnEntityService.setOwner(owner);
        }
    }

    @Override
    public ICubeColumnEntityService getColumn(BIColumnKey columnKey) throws BICubeColumnAbsentException {
        if (columnKey2ColumnMap.containsKey(columnKey)) {
            return columnKey2ColumnMap.get(columnKey);
        } else {
            throw new BICubeColumnAbsentException("Please register Cube Column Service firstly");
        }
    }

    public Set<BIColumnKey> getCubeColumnInfo() {
        return columnKey2ColumnMap.keySet();
    }

    public void registerColumn(ICubeColumnEntityService columnEntityService, BIColumnKey columnKey) {
        if (!columnKey2ColumnMap.containsKey(columnKey)) {
            columnKey2ColumnMap.put(columnKey, columnEntityService);
        }
    }

    /**
     * @param columnEntityService
     * @return
     */
    private ICubeColumnEntityService insertFieldRelationManager(ICubeColumnEntityService columnEntityService, BIColumnKey currentFieldKey) {
        columnEntityService.setRelationManagerService(new BICubeFieldRelationManager(resourceRetrievalService, tableKey, currentFieldKey, discovery));
        return columnEntityService;
    }


    private void initialColumn(List<ICubeFieldSource> fieldSet, ITableKey tableKey) {
        for (int i = 0; i < fieldSet.size(); i++) {
            try {
                ICubeFieldSource field = fieldSet.get(i);
                switch (field.getFieldType()) {
                    case DBConstant.COLUMN.DATE:
                        initialDataColumn(field, tableKey);
                        break;
                    case DBConstant.COLUMN.NUMBER:
                        switch (field.getClassType()) {
                            case DBConstant.CLASS.INTEGER:
                            case DBConstant.CLASS.LONG: {
                                initialLongColumn(field, tableKey);
                                break;
                            }
                            default: {
                                initialDoubleColumn(field, tableKey);
                                break;
                            }
                        }
                        break;
                    case DBConstant.COLUMN.STRING:
                        initialStringColumn(field, tableKey);
                        break;
                }
            } catch (Exception e) {
                BILoggerFactory.getLogger().error(e.getMessage(), e);
                continue;

            }
        }

    }

    private void initialDataColumn(ICubeFieldSource field, ITableKey tableKey) {
        if (field.getFieldType() == DBConstant.COLUMN.DATE) {
            try {
                ICubeResourceLocation fieldLocation = resourceRetrievalService.retrieveResource(tableKey, BIColumnKey.covertColumnKey(field));
                BICubeDateColumn dateColumn = new BICubeDateColumn(discovery, fieldLocation);
                BIColumnKey columnKey = new BIColumnKey(field.getFieldName(), BIColumnKey.DATA_COLUMN_TYPE, BIColumnKey.EMPTY_SUB_TYPE);
                this.registerColumn(insertFieldRelationManager(dateColumn, columnKey),
                        columnKey);
                initialYearColumn(field, tableKey, dateColumn);
                initialMonthColumn(field, tableKey, dateColumn);
                initialDayColumn(field, tableKey, dateColumn);
                initialSeasonColumn(field, tableKey, dateColumn);
                initialWeekColumn(field, tableKey, dateColumn);
                initialYearMonthDayColumn(field, tableKey, dateColumn);
            } catch (Exception e) {
                BINonValueUtils.beyondControl(e.getMessage(), e);
            }
        }
    }

    private ITableKey convert(CubeTableSource tableSource) {
        return new BITableKey(tableSource);
    }

    private void initialLongColumn(ICubeFieldSource field, ITableKey tableKey) {
        if (field.getFieldType() == DBConstant.COLUMN.NUMBER) {
            try {
                BIColumnKey columnKey = new BIColumnKey(field.getFieldName(), BIColumnKey.LONG_COLUMN_TYPE, BIColumnKey.EMPTY_SUB_TYPE);
                ICubeResourceLocation longLocation = resourceRetrievalService.retrieveResource(tableKey, columnKey
                );
                this.registerColumn(insertFieldRelationManager(new BICubeLongColumn(discovery, longLocation), columnKey),
                        columnKey);
            } catch (Exception e) {
                throw BINonValueUtils.beyondControl();
            }
        }
    }

    private void initialStringColumn(ICubeFieldSource field, ITableKey tableKey) {
        if (field.getFieldType() == DBConstant.COLUMN.STRING) {
            try {
                BIColumnKey columnKey = new BIColumnKey(field.getFieldName(), BIColumnKey.STRING_COLUMN_TYPE, BIColumnKey.EMPTY_SUB_TYPE);
                ICubeResourceLocation stringLocation = resourceRetrievalService.retrieveResource(tableKey, columnKey
                );
                this.registerColumn(insertFieldRelationManager(new BICubeStringColumn(discovery, stringLocation), columnKey),
                        columnKey);
            } catch (Exception e) {
                throw BINonValueUtils.beyondControl();
            }
        }
    }

    private void initialDoubleColumn(ICubeFieldSource field, ITableKey tableKey) {
        if (field.getFieldType() == DBConstant.COLUMN.NUMBER) {
            try {
                BIColumnKey columnKey = new BIColumnKey(field.getFieldName(), BIColumnKey.DOUBLE_COLUMN_TYPE, BIColumnKey.EMPTY_SUB_TYPE);
                ICubeResourceLocation doubleLocation = resourceRetrievalService.retrieveResource(tableKey, columnKey
                );
                this.registerColumn(insertFieldRelationManager(new BICubeDoubleColumn(discovery, doubleLocation), columnKey),
                        columnKey);
            } catch (Exception e) {
                throw BINonValueUtils.beyondControl();
            }
        }
    }

    private void initialYearColumn(ICubeFieldSource field, ITableKey tableKey, BICubeDateColumn hostDataColumn) {
        if (field.getFieldType() == DBConstant.COLUMN.DATE) {
            try {
                ICubeResourceLocation baseDataLocation = resourceRetrievalService.retrieveResource(tableKey, BIColumnKey.covertColumnKey(field));
                ICubeResourceLocation yearLocation = BIDateLocationTool.createYear(baseDataLocation);
                BIColumnKey columnKey = BIDateColumnTool.generateYear(field);
                BICubeYearColumn yearColumn = new BICubeYearColumn(discovery, yearLocation, hostDataColumn);
                hostDataColumn.addSubColumns(yearColumn);
                this.registerColumn(insertFieldRelationManager(yearColumn, columnKey),
                        columnKey);
            } catch (Exception e) {
                throw BINonValueUtils.beyondControl();
            }
        }
    }

    private void initialMonthColumn(ICubeFieldSource field, ITableKey tableKey, BICubeDateColumn hostDataColumn) {
        if (field.getFieldType() == DBConstant.COLUMN.DATE) {
            try {
                ICubeResourceLocation baseDataLocation = resourceRetrievalService.retrieveResource(tableKey, BIColumnKey.covertColumnKey(field));
                ICubeResourceLocation monthLocation = BIDateLocationTool.createMonth(baseDataLocation);
                BIColumnKey columnKey = BIDateColumnTool.generateMonth(field);
                BICubeMonthColumn monthColumn = new BICubeMonthColumn(discovery, monthLocation, hostDataColumn);
                hostDataColumn.addSubColumns(monthColumn);
                this.registerColumn(insertFieldRelationManager(monthColumn, columnKey),
                        columnKey);
            } catch (Exception e) {
                throw BINonValueUtils.beyondControl();
            }
        }
    }

    private void initialSeasonColumn(ICubeFieldSource field, ITableKey tableKey, BICubeDateColumn hostDataColumn) {
        if (field.getFieldType() == DBConstant.COLUMN.DATE) {
            try {
                ICubeResourceLocation baseDataLocation = resourceRetrievalService.retrieveResource(tableKey, BIColumnKey.covertColumnKey(field));
                ICubeResourceLocation seasonLocation = BIDateLocationTool.createSeason(baseDataLocation);
                BIColumnKey columnKey = BIDateColumnTool.generateSeason(field);
                BICubeSeasonColumn seasonColumn = new BICubeSeasonColumn(discovery, seasonLocation, hostDataColumn);
                hostDataColumn.addSubColumns(seasonColumn);
                this.registerColumn(insertFieldRelationManager(seasonColumn, columnKey),
                        columnKey);
            } catch (Exception e) {
                throw BINonValueUtils.beyondControl();
            }
        }
    }

    private void initialWeekColumn(ICubeFieldSource field, ITableKey tableKey, BICubeDateColumn hostDataColumn) {
        if (field.getFieldType() == DBConstant.COLUMN.DATE) {
            try {
                ICubeResourceLocation baseDataLocation = resourceRetrievalService.retrieveResource(tableKey, BIColumnKey.covertColumnKey(field));
                ICubeResourceLocation weekLocation = BIDateLocationTool.createWeek(baseDataLocation);
                BIColumnKey columnKey = BIDateColumnTool.generateWeek(field);
                BICubeWeekColumn weekColumn = new BICubeWeekColumn(discovery, weekLocation, hostDataColumn);
                hostDataColumn.addSubColumns(weekColumn);
                this.registerColumn(insertFieldRelationManager(weekColumn, columnKey),
                        columnKey);
            } catch (Exception e) {
                throw BINonValueUtils.beyondControl();
            }
        }
    }

    private void initialDayColumn(ICubeFieldSource field, ITableKey tableKey, BICubeDateColumn hostDataColumn) {
        if (field.getFieldType() == DBConstant.COLUMN.DATE) {
            try {
                ICubeResourceLocation baseDataLocation = resourceRetrievalService.retrieveResource(tableKey, BIColumnKey.covertColumnKey(field));
                ICubeResourceLocation dayLocation = BIDateLocationTool.createDay(baseDataLocation);
                BIColumnKey columnKey = BIDateColumnTool.generateDay(field);
                BICubeDayColumn dayColumn = new BICubeDayColumn(discovery, dayLocation, hostDataColumn);
                hostDataColumn.addSubColumns(dayColumn);
                this.registerColumn(insertFieldRelationManager(dayColumn, columnKey),
                        columnKey);
            } catch (Exception e) {
                throw BINonValueUtils.beyondControl();
            }
        }
    }

    private void initialYearMonthDayColumn(ICubeFieldSource field, ITableKey tableKey, BICubeDateColumn hostDataColumn) {
        if (field.getFieldType() == DBConstant.COLUMN.DATE) {
            try {
                ICubeResourceLocation baseDataLocation = resourceRetrievalService.retrieveResource(tableKey, BIColumnKey.covertColumnKey(field));
                ICubeResourceLocation yearMonthDayLocation = BIDateLocationTool.createYearMonthDay(baseDataLocation);
                BIColumnKey columnKey = BIDateColumnTool.generateYearMonthDay(field);
                BICubeYearMonthDayColumn yearMonthDayColumn = new BICubeYearMonthDayColumn(discovery, yearMonthDayLocation, hostDataColumn);
                hostDataColumn.addSubColumns(yearMonthDayColumn);
                this.registerColumn(insertFieldRelationManager(yearMonthDayColumn, columnKey)
                        , columnKey);
            } catch (Exception e) {
                throw BINonValueUtils.beyondControl();
            }
        }
    }

    @Override
    public void clear() {
        Iterator<ICubeColumnEntityService> it = columnKey2ColumnMap.values().iterator();
        while (it.hasNext()) {
            it.next().clear();
        }
    }

    public void buildStructure() {
        for (ICubeColumnEntityService columnEntityService : columnKey2ColumnMap.values()) {
            columnEntityService.buildStructure();
        }
    }

    @Override
    public void forceReleaseWriter() {
        Iterator<ICubeColumnEntityService> it = columnKey2ColumnMap.values().iterator();
        while (it.hasNext()) {
            it.next().forceReleaseWriter();
        }
        columnKey2ColumnMap.clear();
    }
    @Override
    public void forceReleaseReader() {
        Iterator<ICubeColumnEntityService> it = columnKey2ColumnMap.values().iterator();
        while (it.hasNext()) {
            it.next().forceReleaseReader();
        }
        columnKey2ColumnMap.clear();
    }
}
