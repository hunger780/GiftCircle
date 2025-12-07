package com.giftcircle.backend.service;

import com.giftcircle.backend.model.WishlistItem;
import com.giftcircle.backend.model.WishlistItem.Contribution;
import com.giftcircle.backend.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    public WishlistItem createItem(WishlistItem item) {
        return wishlistRepository.save(item);
    }

    public List<WishlistItem> getAllItems() {
        return wishlistRepository.findAll();
    }

    public Optional<WishlistItem> getItemById(String id) {
        return wishlistRepository.findById(id);
    }
    
    public List<WishlistItem> getUserWishlist(String userId) {
        return wishlistRepository.findByUserId(userId);
    }

    public WishlistItem updateItem(String id, WishlistItem item) {
         if (wishlistRepository.existsById(id)) {
            item.setId(id);
            return wishlistRepository.save(item);
        }
        return null;
    }

    public void deleteItem(String id) {
        wishlistRepository.deleteById(id);
    }
    
    public WishlistItem addContribution(String itemId, Contribution contribution) {
        Optional<WishlistItem> itemOpt = wishlistRepository.findById(itemId);
        if (itemOpt.isPresent()) {
            WishlistItem item = itemOpt.get();
            contribution.setId(UUID.randomUUID().toString());
            contribution.setTimestamp(System.currentTimeMillis());
            item.getContributions().add(contribution);
            
            // Update funded amount
            double currentFunded = item.getFundedAmount();
            item.setFundedAmount(currentFunded + contribution.getAmount());
            
            return wishlistRepository.save(item);
        }
        return null;
    }
}
