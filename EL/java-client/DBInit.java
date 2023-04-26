package sqlintegration;

import java.sql.Connection;
import java.io.File;
import java.util.Scanner;
import java.util.Map;
import static java.util.Map.entry;

public class DBInit {
    public static void main(String[] args) throws java.io.FileNotFoundException {
        Connection conn = SQLOps.createNewConnection("generic_db", "root", "12345");
        Map<String, String> dtype_mapping = java.util.Map.ofEntries(
            entry("HSCode", "smallint"),
            entry("Commodity", "tinytext"),
            entry("value", "float"),
            entry("country", "tinytext"),
            entry("year", "smallint")
        );
        File data_file = new File("java-client/data/"+
                                  "2018-2010_import.csv");
        Scanner sc = new Scanner(data_file);
        String col_headings[] = sc.nextLine().split(","), cols="";
        for(String heading: col_headings)
            cols = cols + heading+" "+ dtype_mapping.getOrDefault(heading, "tinytext")+",";
        cols = cols.substring(0, cols.length()-1);
        SQLOps.executeSQLInstr("create table data ( "+ cols +" );", conn);
    }
}