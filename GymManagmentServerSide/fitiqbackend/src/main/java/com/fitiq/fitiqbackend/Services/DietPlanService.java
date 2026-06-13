package com.fitiq.fitiqbackend.Services;

import org.springframework.stereotype.Service;
import com.fitiq.fitiqbackend.Models.DietPlan;
import com.fitiq.fitiqbackend.Repository.DietPlanRepository;

import java.util.List;
import java.util.Optional;

@Service
public class DietPlanService {

    private final DietPlanRepository dietPlanRepository;

    public DietPlanService(DietPlanRepository dietPlanRepository) {
        this.dietPlanRepository = dietPlanRepository;
    }

    // Create or update a diet plan
    public DietPlan saveDietPlan(DietPlan dietPlan) {
        return dietPlanRepository.save(dietPlan);
    }

    // Fetch a diet plan by its ID
    public Optional<DietPlan> getDietPlanById(String id) {
        return dietPlanRepository.findById(id);
    }

    // Fetch all diet plans for a member
    public List<DietPlan> getDietPlansByMemberId(String memberId) {
        return dietPlanRepository.findByMemberId(memberId);
    }

    // Fetch all diet plans for a fitness assessment
    public List<DietPlan> getDietPlansByAssessmentId(String assessmentId) {
        return dietPlanRepository.findByFitnessAssessmentId(assessmentId);
    }

    // Delete a diet plan
    public void deleteDietPlan(String id) {
        dietPlanRepository.deleteById(id);
    }

    public List<DietPlan> getDietPlansByTrainerId(String trainerId) {
      return dietPlanRepository.findByTrainerId(trainerId);
    }
}
