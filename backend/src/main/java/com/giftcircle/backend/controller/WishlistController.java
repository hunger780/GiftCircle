package com.giftcircle.backend.controller;

import com.giftcircle.backend.model.WishlistItem;
import com.giftcircle.backend.model.WishlistItem.Contribution;
import com.giftcircle.backend.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "*")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @PostMapping
    public ResponseEntity<WishlistItem> createItem(@RequestBody WishlistItem item) {
        return ResponseEntity.ok(wishlistService.createItem(item));
    }

    @GetMapping
    public List<WishlistItem> getAllItems() {
        return wishlistService.getAllItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WishlistItem> getItemById(@PathVariable String id) {
        Optional<WishlistItem> item = wishlistService.getItemById(id);
        return item.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<WishlistItem> updateItem(@PathVariable String id, @RequestBody WishlistItem item) {
        WishlistItem updatedItem = wishlistService.updateItem(id, item);
        if (updatedItem != null) {
            return ResponseEntity.ok(updatedItem);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        wishlistService.deleteItem(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/user/{userId}")
    public List<WishlistItem> getUserWishlist(@PathVariable String userId) {
        return wishlistService.getUserWishlist(userId);
    }
    
    @PostMapping("/{id}/contribute")
    public ResponseEntity<WishlistItem> contribute(@PathVariable String id, @RequestBody Contribution contribution) {
        WishlistItem updatedItem = wishlistService.addContribution(id, contribution);
         if (updatedItem != null) {
            return ResponseEntity.ok(updatedItem);
        }
        return ResponseEntity.notFound().build();
    }
}
