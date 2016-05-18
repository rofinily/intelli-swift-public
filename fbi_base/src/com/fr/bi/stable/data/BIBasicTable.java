package com.fr.bi.stable.data;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Created by Connery on 2015/12/23.
 */
public class BIBasicTable extends BITable {
    protected List<BIBasicField> fieldArray;

    public BIBasicTable(String id) {
        super(id);
        this.fieldArray = new ArrayList<BIBasicField>();
    }

    public BIBasicTable(BITableID table) {
        this(table.getIdentityValue());
    }

    public BIBasicTable() {
        this("Default_ID");
    }

    public BIBasicTable(Table table) {
        super(table);
        if (table instanceof BIBasicTable) {
            if (table != null) {
                fieldArray = new ArrayList<BIBasicField>(((BIBasicTable) table).getFieldArray());
            } else {
                fieldArray = new ArrayList<BIBasicField>();
            }
        }
    }

    public List<BIBasicField> getFieldArray() {
        return Collections.unmodifiableList(fieldArray);
    }

    public void setFieldArray(List<BIBasicField> fieldArray) {
        this.fieldArray = fieldArray;
    }

}