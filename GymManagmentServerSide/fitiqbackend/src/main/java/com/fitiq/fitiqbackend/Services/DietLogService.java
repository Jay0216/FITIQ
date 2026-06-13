package com.fitiq.fitiqbackend.Services;

import com.fitiq.fitiqbackend.Models.DietLog;
import com.fitiq.fitiqbackend.Repository.DietLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DietLogService {

    private final DietLogRepository dietLogRepository;

    public DietLogService(DietLogRepository dietLogRepository) {
        this.dietLogRepository = dietLogRepository;
    }

    // Save a new diet log
    public DietLog saveDietLog(DietLog log) {
        return dietLogRepository.save(log);
    }

    // Get all logs for a member
    public List<DietLog> getLogsByMember(String memberId) {
        return dietLogRepository.findByMemberId(memberId);
    }

    // Get all logs for a diet plan
    public List<DietLog> getLogsByDietPlan(String dietPlanId) {
        return dietLogRepository.findByDietPlanId(dietPlanId);
    }

    // Get logs for a member on a specific date
    public List<DietLog> getLogsByMemberAndDate(String memberId, String date) {
        return dietLogRepository.findByMemberIdAndDate(memberId, date);
    }

    // Get a single log by ID
    public Optional<DietLog> getLogById(String id) {
        return dietLogRepository.findById(id);
    }

    // Delete a log
    public void deleteLog(String id) {
        dietLogRepository.deleteById(id);
    }

    public List<DietLog> getDietLogsByPlan(String dietPlanId) {
        return dietLogRepository.findByDietPlanId(dietPlanId);
    }
}
