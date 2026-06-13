package com.fitiq.fitiqbackend.Services;

import com.fitiq.fitiqbackend.Models.DailySessions;
import com.fitiq.fitiqbackend.Repository.DailySessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DailySessionsService {

    @Autowired
    private DailySessionRepository repository;

    // ── Create a new session
    public DailySessions createSession(DailySessions session) {
        return repository.save(session);
    }

    // ── Get all sessions
    public List<DailySessions> getAllSessions() {
        return repository.findAll();
    }

    // ── Get sessions by member
    public List<DailySessions> getByMember(String memberId) {
        return repository.findByMemberId(memberId);
    }

    // ── Get sessions by plan
    public List<DailySessions> getByPlan(String planId) {
        return repository.findByPlanId(planId);
    }

    // ── Get session by ID
    public Optional<DailySessions> getById(String id) {
        return repository.findById(id);
    }

    // ── Update session
    public DailySessions updateSession(DailySessions session) {
        return repository.save(session);
    }

    // ── Delete session
    public void deleteSession(String id) {
        repository.deleteById(id);
    }

    public List<DailySessions> getSessionsByMemberId(String memberId) {
      return repository.findByMemberId(memberId);
    }
}
