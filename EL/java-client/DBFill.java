package sqlintegration;

import java.sql.Connection;

public class DBFill {
    public static void main(String[] args) throws java.io.FileNotFoundException {
        Connection conn = SQLOps.createNewConnection("generic_db", "root", "12345");
        conn.AllowLoadLocalInfile = true;
        SQLOps.executeSQLInstr("set global local_infile='on';", conn);
        SQLOps.executeSQLInstr("load data local infile "+
        "'java-client/data/2018-2010_import.csv' "+
        "into table data "+
        "fields terminated by ',' "+
        "optionally enclosed by '\"' "+
        "lines terminated by '\n' "+
        "ignore 1 lines;", conn);
    }
}