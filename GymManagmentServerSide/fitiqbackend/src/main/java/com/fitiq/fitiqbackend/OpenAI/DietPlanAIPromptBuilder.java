package com.fitiq.fitiqbackend.OpenAI;

import com.fitiq.fitiqbackend.DTO.DietPlanAIRequest;

public class DietPlanAIPromptBuilder {

    public static String buildPrompt(DietPlanAIRequest request) {

        return """
You are a certified sports nutritionist and diet planning expert.

Create a personalized diet plan summary based on the following fitness profile.

Fitness Profile
Age: %s
Height: %s
Weight: %s
Fitness Goal: %s
Fitness Level: %s
Injuries or Limitations: %s
Notes: %s

Your response MUST be valid JSON only.

Do NOT include explanations, markdown, or backticks.

Return EXACTLY in this structure:

{
"title": "Short diet plan name",
"description": "1-2 sentence summary of the diet plan",
"goal": "Muscle Gain | Fat Loss | Maintenance | Recomposition | General Fitness",
"dailyCalorieTarget": "example: 2500 kcal",
"proteinTarget": "example: 180g",
"carbTarget": "example: 300g",
"fatTarget": "example: 70g"
}

Ensure calories and macros match the goal and body metrics.
""".formatted(
                request.getAge(),
                request.getHeight(),
                request.getWeight(),
                request.getGoal(),
                request.getFitnessLevel(),
                request.getInjuries(),
                request.getNotes()
        );
    }
}