package com.digitalclock;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class ClockServer {
    private static final Map<String, String> RESOURCES = Map.of(
            "/", "/index.html",
            "/index.html", "/index.html",
            "/styles.css", "/styles.css",
            "/clock.js", "/clock.js");

    private ClockServer() {
    }

    public static void main(String[] args) throws IOException {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);
        ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
        server.setExecutor(executor);
        server.createContext("/", ClockServer::handleRequest);
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            server.stop(0);
            executor.shutdown();
        }, "clock-shutdown"));
        server.start();
        System.out.println("Digital Clock listening on port " + port);
    }

    private static void handleRequest(HttpExchange exchange) throws IOException {
        if (!"GET".equals(exchange.getRequestMethod())) {
            send(exchange, 405, "text/plain; charset=utf-8", "Method Not Allowed");
            return;
        }

        String path = exchange.getRequestURI().getPath();
        if ("/health".equals(path)) {
            send(exchange, 200, "text/plain; charset=utf-8", "ok");
            return;
        }

        String resource = RESOURCES.get(path);
        if (resource == null) {
            send(exchange, 404, "text/plain; charset=utf-8", "Not Found");
            return;
        }

        try (InputStream content = ClockServer.class.getResourceAsStream(resource)) {
            if (content == null) {
                send(exchange, 500, "text/plain; charset=utf-8", "Resource unavailable");
                return;
            }
            byte[] body = content.readAllBytes();
            String contentType = resource.endsWith(".css")
                    ? "text/css; charset=utf-8"
                    : resource.endsWith(".js")
                            ? "text/javascript; charset=utf-8"
                            : "text/html; charset=utf-8";
            send(exchange, 200, contentType, body);
        }
    }

    private static void send(HttpExchange exchange, int status, String contentType, String body)
            throws IOException {
        send(exchange, status, contentType, body.getBytes(StandardCharsets.UTF_8));
    }

    private static void send(HttpExchange exchange, int status, String contentType, byte[] body)
            throws IOException {
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        exchange.getResponseHeaders().set("X-Frame-Options", "DENY");
        exchange.getResponseHeaders().set("Referrer-Policy", "no-referrer");
        exchange.getResponseHeaders().set("Content-Security-Policy",
                "default-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'");
        exchange.sendResponseHeaders(status, body.length);
        try (OutputStream response = exchange.getResponseBody()) {
            response.write(body);
        }
    }
}
