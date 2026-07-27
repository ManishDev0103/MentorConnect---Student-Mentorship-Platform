package com.mentorship.entities;

import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "mentors")
@NoArgsConstructor
@Getter
@Setter
@ToString(callSuper = true, exclude = { "userDetails" })
public class Mentor extends BaseEntity {

	@Id // PK constraint
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long mentorId;

	@OneToOne(optional = false, cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_mentor_user"))
	private User userDetails;

	@Column(name = "specialization", length = 100)
	private String specialization;

	@Column(name = "experience", length = 80)
	private String experience;

	@Column(name = "rate_per_session")
	private double ratePerSession;

	@Column(name = "discount_percent")
	private double discountPercent;

	@Column(name = "is_deleted")
	private Boolean deleted = false;

	@Enumerated(EnumType.STRING)
	@Column(name = "verification_status", length = 20)
	private VerificationStatus verificationStatus;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "verified_by", foreignKey = @ForeignKey(name = "fk_mentor_verified_by"))
	private User verifiedBy;

	// new fields added
	@Column(name = "highest_education", nullable = false, length = 100)
	private String highestEducation;

	@Column(name = "current_position", nullable = false, length = 100)
	private String currentPosition;

	@Column(name = "organization", nullable = false, length = 100)
	private String organization;

	@Lob
	@Column(name = "professional_bio", nullable = false, columnDefinition = "TEXT")
	private String professionalBio;

	/*
	 * @ElementCollection(fetch = FetchType.LAZY)
	 * 
	 * @CollectionTable( name = "mentor_expertise", joinColumns = @JoinColumn(name =
	 * "mentor_id") )
	 * 
	 * @Column(name = "expertise") private Set<String> expertiseAreas;
	 */

	@Column(name = "linkedin_url")
	private String linkedinUrl;

	@Column(name = "portfolio_url")
	private String portfolioUrl;

	// for resume handling
	@Lob
	@Column(name = "resume", columnDefinition = "LONGBLOB")
	private byte[] resume;

	@Column(name = "resume_file_name")
	private String resumeFileName;

	@Column(name = "resume_content_type")
	private String resumeContentType;

}
