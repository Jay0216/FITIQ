package com.fitiq.fitiqbackend.OpenAI;

import com.fitiq.fitiqbackend.DTO.DietLogAIRequest;

public class DietLogAIPromptBuilder {

    public static String buildPrompt(DietLogAIRequest request) {

        return """
You are a professional nutritionist and calorie tracking expert.

Analyze the following meal items and estimate total nutritional values.

Meal Items:
%s

IMPORTANT:
- Provide realistic and accurate estimates
- Combine all items into total values
- Do NOT explain anything

Return ONLY valid JSON in this exact format:

{
"calories": "example: 500 kcal",
"protein": "example: 30g",
"carbs": "example: 45g",
"fats": "example: 20g"
}
""".formatted(request.getMealItems());
    }
}
