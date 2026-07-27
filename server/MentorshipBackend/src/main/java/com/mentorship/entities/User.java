package com.mentorship.entities;

import java.time.LocalDate;



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
	
	@Column(name="phone_no",length=14, unique = true)
	private String phoneNo;
	
	@Enumerated(EnumType.STRING)
	@Column(name="user_role")
	private UserRole userRole;

	@Column(name="is_deleted")
	private Boolean deleted = false;

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
	}
	
	

}
