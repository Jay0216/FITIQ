package com.fitiq.fitiqbackend.Repository;

import com.fitiq.fitiqbackend.Models.WorkoutPlans;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutPlanRepository extends MongoRepository<WorkoutPlans, String> {

    List<WorkoutPlans> findByMemberId(String memberId);

    List<WorkoutPlans> findByTrainerId(String trainerId);

    List<WorkoutPlans> findByFitnessAssessmentId(String fitnessAssessmentId);

}