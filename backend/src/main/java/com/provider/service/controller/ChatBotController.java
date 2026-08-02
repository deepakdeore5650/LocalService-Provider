package com.provider.service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatBotController {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String apiUrl;

    @Autowired
    private RestTemplate restTemplate;

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                return ResponseEntity.ok(Map.of("reply", "API key not configured"));
            }

            String message = request.getMessage();
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.ok(Map.of("reply", "Message cannot be empty"));
            }

            Map<String, Object> reqBody = buildRequest(message);
            String response = restTemplate.postForObject(apiUrl + "?key=" + apiKey, reqBody, String.class);
            String reply = parseResponse(response);

            return ResponseEntity.ok(Map.of("reply", reply));

        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("429")) {
                return ResponseEntity.ok(Map.of(
                    "reply", "Quota exceeded. Enable billing at https://console.cloud.google.com to continue."
                ));
            }
            return ResponseEntity.ok(Map.of("reply", "Error: " + e.getMessage()));
        }
    }

    private Map<String, Object> buildRequest(String message) {
        Map<String, Object> request = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, String> part = new HashMap<>();

        part.put("text", message);
        content.put("parts", new Object[]{part});
        request.put("contents", new Object[]{content});

        return request;
    }

    private String parseResponse(String response) throws Exception {
        JsonNode root = new ObjectMapper().readTree(response);

        if (root.has("candidates") && root.get("candidates").size() > 0) {
            JsonNode candidate = root.get("candidates").get(0);
            if (candidate.has("content")) {
                JsonNode parts = candidate.get("content").get("parts");
                if (parts.size() > 0 && parts.get(0).has("text")) {
                    return parts.get(0).get("text").asText();
                }
            }
        }

        return "Unable to generate response";
    }

    public static class ChatRequest {
        private String message;
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
