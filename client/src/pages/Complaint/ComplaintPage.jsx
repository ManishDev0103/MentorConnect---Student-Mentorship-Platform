import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { complaintService } from "../../service/complaintService";
import { showError, showSuccess } from "../../utils/toast";
import "./ComplaintPage.css";

const ComplaintPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [mentorSearch, setMentorSearch] = useState("");
  const [mentors, setMentors] = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const formatSubmittedDate = (createdAt) => {
    if (!createdAt) return "-";

    const date = new Date(createdAt);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
  };

  const visibleMentors = useMemo(() => {
    const searchTerm = mentorSearch.trim().toLowerCase();
    if (!searchTerm) return mentors;

    return mentors
      .filter((mentor) =>
        [mentor.name, mentor.specialization, mentor.expertise, mentor.userId]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchTerm)),
      );
  }, [mentorSearch, mentors]);

  useEffect(() => {
    loadComplaints();
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setMentorsLoading(true);
      const response = await complaintService.getMentorsForTarget();
      setMentors(
        (response || []).filter(
          (mentor) => String(mentor.verificationStatus || "VERIFIED").toUpperCase() === "VERIFIED",
        ),
      );
    } catch (error) {
      console.error("Unable to load mentors for complaint", error);
    } finally {
      setMentorsLoading(false);
    }
  };

  const selectMentor = (mentor) => {
    setTargetUserId(String(mentor.userId));
    setMentorSearch(mentor.name ? `${mentor.name} (ID: ${mentor.userId})` : String(mentor.userId));
  };

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintService.getMyComplaints();
      setComplaints(response || []);
    } catch (error) {
      console.error("Unable to load complaints", error);
      showError("Unable to load your complaints. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) {
      showError("Please provide a title and description for your complaint.");
      return;
    }

    try {
      setSubmitting(true);
      await complaintService.createComplaint({
        title: title.trim(),
        description: description.trim(),
        targetUserId: targetUserId ? Number(targetUserId) : null,
      });
      showSuccess("Complaint submitted successfully.");
      setTitle("");
      setDescription("");
      setTargetUserId("");
      setMentorSearch("");
      loadComplaints();
    } catch (error) {
      console.error("Error submitting complaint", error);
      showError(error?.message || "Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="complaint-page container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title">Support & Complaints</h2>
          <p className="page-subtitle">Submit a ticket or review your existing complaints.</p>
        </div>
        <div className="complaint-page-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>

      <div className="complaint-grid">
        <section className="complaint-form-card">
          <h4>Submit a new complaint</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="complaintTitle">Title</label>
              <input
                id="complaintTitle"
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="complaintDescription">Description</label>
              <textarea
                id="complaintDescription"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe what happened and how we can help."
                required
              />
            </div>
            <div className="form-group mentor-target-picker">
              <label htmlFor="mentorSearch">Related mentor (optional)</label>
              <input
                id="mentorSearch"
                type="search"
                className="form-control"
                value={mentorSearch}
                onChange={(e) => {
                  setMentorSearch(e.target.value);
                  setTargetUserId("");
                }}
                placeholder={mentorsLoading ? "Loading mentors..." : "Search mentor by name, subject, or ID"}
                autoComplete="off"
              />
              {mentorSearch.trim() && !targetUserId && visibleMentors.length > 0 && (
                <div className="mentor-suggestions" role="listbox">
                  {visibleMentors.map((mentor) => (
                    <button
                      type="button"
                      className="mentor-suggestion"
                      key={mentor.userId}
                      onClick={() => selectMentor(mentor)}
                    >
                      <strong>{mentor.name || "Mentor"}</strong>
                      <span>
                        {mentor.specialization || mentor.expertise || "General"} | ID {mentor.userId}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {mentorSearch.trim() && !targetUserId && !mentorsLoading && visibleMentors.length === 0 && (
                <div className="mentor-search-empty">No matching mentor found. You can enter an ID below.</div>
              )}
              {targetUserId && (
                <button
                  type="button"
                  className="clear-mentor-button"
                  onClick={() => {
                    setTargetUserId("");
                    setMentorSearch("");
                  }}
                >
                  Clear selected mentor
                </button>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="targetUserId">Or enter mentor / student ID (optional)</label>
              <input
                id="targetUserId"
                type="number"
                className="form-control"
                value={targetUserId}
                onChange={(e) => {
                  setTargetUserId(e.target.value);
                  setMentorSearch(e.target.value);
                }}
                placeholder="Enter user ID if applicable"
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </form>
        </section>

        <section className="complaint-list-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Your tickets</h4>
            <span className="text-muted">{complaints.length} submitted</span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="alert alert-info">No complaints submitted yet.</div>
          ) : (
            <div className="table-responsive complaint-table">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Response</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.complaintId}>
                      <td>{complaint.title}</td>
                      <td>
                        <span className={`complaint-status status-${complaint.status?.toLowerCase()}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td>{complaint.response || "Awaiting review"}</td>
                      <td>{formatSubmittedDate(complaint.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ComplaintPage;
