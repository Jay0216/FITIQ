package com.fitiq.fitiqbackend.Repository;

import com.fitiq.fitiqbackend.Models.DailySessions;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DailySessionRepository extends MongoRepository<DailySessions, String> {
    List<DailySessions> findByMemberId(String memberId);
    List<DailySessions> findByPlanId(String planId);
}
