package com.fitiq.fitiqbackend.Services;

import com.fitiq.fitiqbackend.Models.Appointments;
import com.fitiq.fitiqbackend.Repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository repository;

    public AppointmentService(AppointmentRepository repository) {
        this.repository = repository;
    }

    // Create Appointment
    public Appointments createAppointment(Appointments appointment) {
        return repository.save(appointment);
    }

    // Get All Appointments
    public List<Appointments> getAllAppointments() {
        return repository.findAll();
    }

    // Get Appointment by ID
    public Appointments getAppointmentById(String id) {
        return repository.findById(id).orElse(null);
    }

    // Get Appointments by Trainer
    public List<Appointments> getAppointmentsByTrainer(String trainerId) {
        return repository.findByTrainerId(trainerId);
    }

    // Get Appointments by Date
    public List<Appointments> getAppointmentsByDate(String date) {
        return repository.findByDate(date);
    }

    // Update Status
    public Appointments updateStatus(String id, String status) {
        Appointments appointment = repository.findById(id).orElse(null);

        if (appointment != null) {
            appointment.setStatus(status);
            return repository.save(appointment);
        }

        return null;
    }

    // Delete Appointment
    public void deleteAppointment(String id) {
        repository.deleteById(id);
    }

    public List<Appointments> getAppointmentsByMember(String memberId) {
      return repository.findByMemberId(memberId);
    }

    // ─── Update appointment (status, etc.)
    public Appointments updateAppointment(Appointments appointment) {
        return repository.save(appointment);  // save() will update if ID exists
    }

    
}
