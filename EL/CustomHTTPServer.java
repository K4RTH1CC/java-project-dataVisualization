import sqlintegration.SQLOps;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

import java.util.ArrayList;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import com.google.gson.Gson;

public class CustomHTTPServer {

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
        server.createContext("/data", new DataHandler());
        server.setExecutor(null);
        server.start();
    }

    static class DataHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException, FileNotFoundException {
            Connection conn = SQLOps.createNewConnection("generic_db", "root", "12345");
            SQLOps.executeSQLInstr("use generic_db;", conn);
            ArrayList<Object> result = new ArrayList<>();
            ArrayList<Object> value = new ArrayList<>();
            ArrayList<Object> country = new ArrayList<>();
            ArrayList<Object> year = new ArrayList<>();
            ResultSet rs = SQLOps.executeSQLQuery("select * from data;", conn);
            try{
                value = SQLOps.getResultCol(rs, 3);
            } catch(SQLException e){
                System.out.println("SQLException occured: "+e);
            }
            rs = SQLOps.executeSQLQuery("select * from data;", conn);
            try {
                country = SQLOps.getResultCol(rs, 4);
            } catch(SQLException e){
                System.out.println("SQLException occured: "+e);
            }
            rs = SQLOps.executeSQLQuery("select * from data;", conn);
            try {
                year = SQLOps.getResultCol(rs, 5);
            } catch(SQLException e){
                System.out.println("SQLException occured: "+e);
            }
            result.add(value.subList(0, 600));
            result.add(country.subList(0, 600));
            result.add(year.subList(0, 600));

            String response = new Gson().toJson(result);

            t.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            t.sendResponseHeaders(200, response.getBytes("utf-8").length);
            System.out.println(t.getResponseHeaders().entrySet());
            OutputStream os = t.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }
}