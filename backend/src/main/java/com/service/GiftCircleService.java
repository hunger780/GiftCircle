package com.giftcircle.backend.service;

import com.giftcircle.backend.model.GiftCircle;
import com.giftcircle.backend.repository.GiftCircleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class GiftCircleService {

    @Autowired
    private GiftCircleRepository giftCircleRepository;

    public GiftCircle createCircle(GiftCircle circle) {
        circle.setCreatedTimestamp(System.currentTimeMillis());
        // Ensure admin is in members
        if (circle.getAdminIds() != null && !circle.getAdminIds().isEmpty()) {
            for (String adminId : circle.getAdminIds()) {
                if (!circle.getMemberIds().contains(adminId)) {
                    circle.getMemberIds().add(adminId);
                }
            }
        }
        return giftCircleRepository.save(circle);
    }

    public List<GiftCircle> getAllCircles() {
        return giftCircleRepository.findAll();
    }

    public Optional<GiftCircle> getCircleById(String id) {
        return giftCircleRepository.findById(id);
    }
    
    public List<GiftCircle> getUserCircles(String userId) {
        return giftCircleRepository.findByMemberIdsContains(userId);
    }

    public GiftCircle updateCircle(String id, GiftCircle circle) {
         if (giftCircleRepository.existsById(id)) {
            circle.setId(id);
            return giftCircleRepository.save(circle);
        }
        return null;
    }

    public void deleteCircle(String id) {
        giftCircleRepository.deleteById(id);
    }
}
