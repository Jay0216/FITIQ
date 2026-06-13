package com.fitiq.fitiqbackend.Services;

import com.fitiq.fitiqbackend.Models.FitnessAssessment;
import com.fitiq.fitiqbackend.Repository.FitnessAssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class FitnessAssessmentService {

    private final FitnessAssessmentRepository assessmentRepository;

    @Autowired
    public FitnessAssessmentService(FitnessAssessmentRepository assessmentRepository) {
        this.assessmentRepository = assessmentRepository;
    }

    // Create a new fitness assessment
    public FitnessAssessment createAssessment(FitnessAssessment assessment) {
        assessment.setCreatedAt(new Date());
        return assessmentRepository.save(assessment);
    }

    // Get all assessments
    public List<FitnessAssessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    // Get all assessments for a specific member
    public List<FitnessAssessment> getAssessmentsByMember(String memberId) {
        return assessmentRepository.findByMemberId(memberId);
    }

    // Get the latest assessment for a member
    public Optional<FitnessAssessment> getLatestAssessment(String memberId) {
        return Optional.ofNullable(assessmentRepository.findFirstByMemberIdOrderByCreatedAtDesc());
    }

    // Update an existing assessment
    public FitnessAssessment updateAssessment(String id, FitnessAssessment updatedAssessment) {
        return assessmentRepository.findById(id)
                .map(assessment -> {
                    assessment.setAssessmentName(updatedAssessment.getAssessmentName());
                    assessment.setAge(updatedAssessment.getAge());
                    assessment.setHeight(updatedAssessment.getHeight());
                    assessment.setWeight(updatedAssessment.getWeight());
                    assessment.setFitnessGoal(updatedAssessment.getFitnessGoal());
                    assessment.setFitnessLevel(updatedAssessment.getFitnessLevel());
                    assessment.setLimitations(updatedAssessment.getLimitations());
                    // Optionally update the createdAt or keep original
                    return assessmentRepository.save(assessment);
                })
                .orElseThrow(() -> new RuntimeException("Assessment not found with id: " + id));
    }

    // Delete an assessment
    public void deleteAssessment(String id) {
        assessmentRepository.deleteById(id);
    }

    public void activateAssessment(String assessmentId, String memberId) {

    // 1️⃣ Deactivate all existing assessments for the member (if any)
    List<FitnessAssessment> assessments = assessmentRepository.findByMemberId(memberId);
    if (!assessments.isEmpty()) {
        assessments.forEach(fa -> fa.setActive(false));
        assessmentRepository.saveAll(assessments);
    }

    // 2️⃣ Activate the selected assessment safely
    Optional<FitnessAssessment> optionalAssessment = assessmentRepository.findById(assessmentId);
    if (optionalAssessment.isEmpty()) {
        throw new RuntimeException("Fitness assessment not found with ID: " + assessmentId);
    }

    FitnessAssessment activeAssessment = optionalAssessment.get();
    activeAssessment.setActive(true);

    assessmentRepository.save(activeAssessment);
   }

   public List<FitnessAssessment> getAllActiveAssessments() {
     return assessmentRepository.findByActiveTrue();
   }

   public List<FitnessAssessment> getAssessmentsByFitnessGoal(String fitnessGoal) {
     return assessmentRepository.findByActiveTrueAndFitnessGoal(fitnessGoal);
   }
}
