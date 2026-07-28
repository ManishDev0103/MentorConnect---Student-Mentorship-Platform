export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 20,
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/, 
};

export const passwordMeetsPolicy = (password) => {
  return PASSWORD_POLICY.regex.test(password);
};

export const getPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: "Very weak" };
  }

  let score = 0;
  if (password.length >= PASSWORD_POLICY.minLength) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1;

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
  return {
    score,
    label: labels[Math.min(score, labels.length - 1)],
  };
};

export const getPasswordStrengthColor = (score) => {
  if (score <= 1) return "#ef4444"; // red
  if (score === 2) return "#f59e0b"; // amber
  if (score === 3) return "#fbbf24"; // yellow
  if (score === 4) return "#22c55e"; // green
  return "#16a34a"; // darker green
};

export const getPasswordRequirementItems = () => [
  "8-20 characters",
  "At least one uppercase letter",
  "At least one lowercase letter",
  "At least one number",
  "At least one special character",
];
