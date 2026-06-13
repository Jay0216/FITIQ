package com.fitiq.fitiqbackend.Services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitiq.fitiqbackend.DTO.DietLogAIRequest;
import com.fitiq.fitiqbackend.DTO.DietLogAIResponse;
import com.fitiq.fitiqbackend.OpenAI.DietLogAIPromptBuilder;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class DietLogAIService {

    @Value("${openai.api.key}")
    private String openaiKey;

    @Value("${openai.api.url}")
    private String openaiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public DietLogAIResponse analyzeMeal(DietLogAIRequest request) {

        try {

            String prompt = DietLogAIPromptBuilder.buildPrompt(request);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-4o-mini");

            List<Map<String, String>> messages = new ArrayList<>();

            messages.add(Map.of(
                    "role", "system",
                    "content", "You are a certified nutritionist."
            ));

            messages.add(Map.of(
                    "role", "user",
                    "content", prompt
            ));

            body.put("messages", messages);
            body.put("temperature", 0.3); // more accurate

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    openaiUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            JsonNode root = mapper.readTree(response.getBody());

            String aiText = root
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            aiText = aiText.replace("```json", "")
                    .replace("```", "")
                    .trim();

            return mapper.readValue(aiText, DietLogAIResponse.class);

        } catch (Exception e) {
            throw new RuntimeException("AI Meal Analysis Failed", e);
        }
    }
}
