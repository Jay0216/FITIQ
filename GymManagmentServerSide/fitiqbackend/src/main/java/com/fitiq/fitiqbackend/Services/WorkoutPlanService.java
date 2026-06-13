package com.fitiq.fitiqbackend.Services;

import com.fitiq.fitiqbackend.Models.WorkoutPlans;
import com.fitiq.fitiqbackend.Repository.WorkoutPlanRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutPlanService {

    @Autowired
    private WorkoutPlanRepository workoutPlanRepository;

    // Create workout plan
    public WorkoutPlans createWorkoutPlan(WorkoutPlans plan) {

        return workoutPlanRepository.save(plan);

    }

    // Get workout plans of a member
    public List<WorkoutPlans> getMemberWorkoutPlans(String memberId) {

        return workoutPlanRepository.findByMemberId(memberId);

    }

    // Get trainer created plans
    public List<WorkoutPlans> getTrainerWorkoutPlans(String trainerId) {

        return workoutPlanRepository.findByTrainerId(trainerId);

    }


    public List<WorkoutPlans> getPlansByTrainer(String trainerId) {
      return workoutPlanRepository.findByTrainerId(trainerId);
    }
}
