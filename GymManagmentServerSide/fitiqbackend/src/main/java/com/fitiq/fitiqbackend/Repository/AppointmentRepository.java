package com.fitiq.fitiqbackend.Repository;

import com.fitiq.fitiqbackend.Models.Appointments;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface AppointmentRepository extends MongoRepository<Appointments, String> {

    List<Appointments> findByTrainerId(String trainerId);

    List<Appointments> findByDate(String date);

    List<Appointments> findByStatus(String status);

    List<Appointments> findByMemberId(String memberId);
}