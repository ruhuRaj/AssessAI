export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return '#10B981'; // green
    case 'medium':
      return '#F59E0B'; // amber
    case 'hard':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
};

export const getDifficultyText = (difficulty: string): string => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'Easy';
    case 'medium':
      return 'Moderate';
    case 'hard':
      return 'Challenging';
    default:
      return 'Unknown';
  }
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (date: string | Date): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};
