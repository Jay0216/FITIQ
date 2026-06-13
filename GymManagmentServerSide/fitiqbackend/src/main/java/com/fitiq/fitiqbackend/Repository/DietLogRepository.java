package com.fitiq.fitiqbackend.Repository;

import com.fitiq.fitiqbackend.Models.DietLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DietLogRepository extends MongoRepository<DietLog, String> {

    // Find all logs for a member
    List<DietLog> findByMemberId(String memberId);

    // Find all logs for a specific plan
    List<DietLog> findByDietPlanId(String dietPlanId);

    // Find logs for a member on a specific date
    List<DietLog> findByMemberIdAndDate(String memberId, String date);
}
