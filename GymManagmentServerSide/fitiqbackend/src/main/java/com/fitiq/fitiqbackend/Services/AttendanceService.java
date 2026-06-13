package com.fitiq.fitiqbackend.Services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fitiq.fitiqbackend.Models.Attendance;
import com.fitiq.fitiqbackend.Models.Member;
import com.fitiq.fitiqbackend.Repository.AttendanceRepository;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    public Attendance markAttendance(Member member) {
        Attendance attendance = new Attendance();
        attendance.setMemberId(member.getId());
        attendance.setMemberName(member.getFullname());
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAttendanceByMemberId(String memberId) {
        return attendanceRepository.findByMemberId(memberId);
    }
}