export const generateMeetingLink = (mentorId, sessionDate, startTime) => {
  const seed = `${mentorId}-${sessionDate}-${startTime}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  const positiveHash = Math.abs(hash);
  const meetingId = positiveHash.toString().slice(0, 10).padEnd(10, "0");
  const password = positiveHash.toString(36).slice(0, 6);

  return `https://zoom.us/j/${meetingId}?pwd=${password}`;
};
