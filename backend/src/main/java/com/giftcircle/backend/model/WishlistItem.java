package com.giftcircle.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.List;
import java.util.ArrayList;

@Data
@Document(collection = "wishlist_items")
public class WishlistItem {
    @Id
    private String id;
    private String userId;
    private String title;
    private String description;
    private double price;
    private double fundedAmount;
    private String imageUrl;
    private String productUrl;
    private String eventId;
    private String circleId;
    private List<Contribution> contributions = new ArrayList<>();
    private String status;
    
    @Data
    public static class Contribution {
        private String id;
        private String contributorId;
        private double amount;
        private ContributionType type;
        private long timestamp;
        private boolean isAnonymous;
        private boolean isAmountHidden;
        
        public enum ContributionType {
            LOCKED, FREE
        }
    }
}
