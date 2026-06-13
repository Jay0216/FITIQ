package com.fitiq.fitiqbackend.Repository;

import com.fitiq.fitiqbackend.Models.FitnessAssessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FitnessAssessmentRepository extends MongoRepository<FitnessAssessment, String> {

    // Fetch all assessments for a specific member
    List<FitnessAssessment> findByMemberId(String memberId);

    // Optionally, fetch the latest assessment for a member
    FitnessAssessment findFirstByMemberIdOrderByCreatedAtDesc();

    List<FitnessAssessment> findByActiveTrue();

    List<FitnessAssessment> findByActiveTrueAndFitnessGoal(String fitnessGoal);

    // In FitnessAssessmentRepository
    FitnessAssessment findByMemberIdAndActiveTrue(String memberId);



}
