package com.giftcircle.backend.controller;

import com.giftcircle.backend.model.GiftCircle;
import com.giftcircle.backend.service.GiftCircleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/circles")
@CrossOrigin(origins = "*")
public class GiftCircleController {

    @Autowired
    private GiftCircleService giftCircleService;

    @PostMapping
    public ResponseEntity<GiftCircle> createCircle(@RequestBody GiftCircle circle) {
        return ResponseEntity.ok(giftCircleService.createCircle(circle));
    }

    @GetMapping
    public List<GiftCircle> getAllCircles() {
        return giftCircleService.getAllCircles();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GiftCircle> getCircleById(@PathVariable String id) {
        Optional<GiftCircle> circle = giftCircleService.getCircleById(id);
        return circle.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<GiftCircle> updateCircle(@PathVariable String id, @RequestBody GiftCircle circle) {
        GiftCircle updatedCircle = giftCircleService.updateCircle(id, circle);
        if (updatedCircle != null) {
            return ResponseEntity.ok(updatedCircle);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCircle(@PathVariable String id) {
        giftCircleService.deleteCircle(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/user/{userId}")
    public List<GiftCircle> getUserCircles(@PathVariable String userId) {
        return giftCircleService.getUserCircles(userId);
    }
}
