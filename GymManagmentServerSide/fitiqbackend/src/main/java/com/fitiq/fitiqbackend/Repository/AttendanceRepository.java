package com.fitiq.fitiqbackend.Repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.fitiq.fitiqbackend.Models.Attendance;


@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {
     List<Attendance> findByMemberId(String memberId);
}
