package com.giftcircle.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.List;
import java.util.ArrayList;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String avatar;
    private String dob;
    private String sex;
    private String phoneNumber;
    
    private List<String> friends = new ArrayList<>();
    private List<String> blockedUserIds = new ArrayList<>();
    private List<String> familyMemberIds = new ArrayList<>();
    private List<String> acceptedEventIds = new ArrayList<>();
    private List<String> hiddenEventIds = new ArrayList<>();
    
    private UserSettings settings;
    private BankDetails bankDetails;
    
    @Data
    public static class UserSettings {
        private double defaultGiftAmount;
        private double maxGiftAmount;
        private String currency;
        private boolean autoAcceptContacts;
    }
    
    @Data
    public static class BankDetails {
        private String accountName;
        private String accountNumber;
        private String bankName;
        private String ifscCode;
        private String panNumber;
    }
}
