package com.fitiq.fitiqbackend.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.fitiq.fitiqbackend.Models.DietPlan;
import java.util.List;


@Repository
public interface DietPlanRepository extends MongoRepository<DietPlan, String> {

    // Find all diet plans for a member
    List<DietPlan> findByMemberId(String memberId);

    // Optional: find by assessment id
    //List<DietPlan> findByFitnessAssessmentId(String fitnessAssessmentId);

    List<DietPlan> findByTrainerId(String trainerId);

    List<DietPlan> findByFitnessAssessmentId(String fitnessAssessmentId);
}
