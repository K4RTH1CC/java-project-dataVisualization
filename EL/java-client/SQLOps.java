package sqlintegration;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.ResultSet;

import java.util.ArrayList;

public class SQLOps {
    public static ResultSet executeSQLInstr (String instr, Connection conn) {
        Statement stmt = null;
        ResultSet rs = null;

        try {
            stmt = conn.createStatement();
            if (stmt.execute(instr)) {
                rs = stmt.getResultSet();
            }
        } catch (SQLException ex) {
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        } finally {
            if (rs != null) {
                try {
                    rs.close();
                } catch (SQLException sqlEx) { }
                rs = null;
            }
            if (stmt != null) {
                try {
                    stmt.close();
                } catch (SQLException sqlEx) { }
                stmt = null;
            }
        }
        
        return rs;
    }

    public static ResultSet executeSQLQuery (String instr, Connection conn) {
        Statement stmt = null;
        ResultSet rs = null;

        try {
            stmt = conn.createStatement();
            rs = stmt.executeQuery(instr);
        } catch (SQLException ex) {
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        }
        
        return rs;
    }

    public static Connection createNewConnection (String database, String user, String password) {
        Connection conn = null;

        try {
            conn = DriverManager.getConnection("jdbc:mysql://localhost/"+database+"?"+
                                                "user="+user+
                                                "&password="+password+
                                                "&AllowLoadLocalInfile=true");
        } catch (SQLException ex) {
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        }

        return conn;
    }

    public static ArrayList<Object> getResultCol(ResultSet rs, int col) throws SQLException {
        ArrayList<Object> resultCol = new ArrayList<>();
        rs.next();
        while(rs.isAfterLast() == false){
            resultCol.add(rs.getString(col));
            rs.next();
        }
        return resultCol;
    }

    public static void main(String[] args) {
    }
}