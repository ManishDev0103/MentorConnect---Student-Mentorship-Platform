package com.mentorship.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import com.mentorship.entities.UserStatus;

@Entity
@Table(name = "users")
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude= {"password","image"})
public class User extends BaseEntity{
	@Id //PK constraint
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long userId;
	
	@Column(name="first_name",length = 30, nullable=false)
	private String firstName;
	@Column(name="last_name",length = 30)
	private String lastName;
	
	@Column(length = 50,unique = true, nullable=false)
	private String email;
	
	@Column(length = 400,nullable = false)
	private String password;
	
	private LocalDate dob;
	
	private String address;
	
	@Lob
	@Column(columnDefinition = "LONGBLOB")
	private byte[] image;
	
	@Column(name = "profile_image_path", length = 255)
	private String profileImagePath;
	
	@Column(name="phone_no",length=14, unique = true)
	private String phoneNo;
	
	@Enumerated(EnumType.STRING)
	@Column(name="user_role")
	private UserRole userRole;

	@Enumerated(EnumType.STRING)
	@Column(name = "user_status", length = 20, nullable = false)
	private UserStatus userStatus = UserStatus.ACTIVE;

	@Column(name = "account_restriction_reason", length = 255)
	private String accountRestrictionReason;

	@Column(name = "restriction_until")
	private LocalDateTime restrictionUntil;

	@Column(name="is_deleted", nullable = false)
	private Boolean deleted = false;

	@Column(name = "email_notifications_enabled", nullable = false)
	private Boolean emailNotificationsEnabled = true;

	public boolean isDeleted() {
		return Boolean.TRUE.equals(this.deleted);
	}

	public User(String firstName, String lastName, String email, String password, LocalDate dob, String address,
			String phoneNo) {
		super();
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.password = password;
		this.dob = dob;
		this.address = address;
		this.phoneNo = phoneNo;
		this.emailNotificationsEnabled = true;
	}
	
	

}
