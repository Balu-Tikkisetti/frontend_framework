// Utility function to parse the timestamp string ("MM-dd-yyyy, HH:mm:ss")
export const parseTimestamp = (timestamp: string): Date => {
    const [datePart, timePart] = timestamp.split(", ");
    const [month, day, year] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  };
  
  // Utility function to format relative time
  export const formatRelativeTime = (timestamp: string): string => {
    const date = parseTimestamp(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) {
      return `${diffMins} mins ago`;
    }
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 24) {
      return `${diffHrs} hrs ago`;
    }
    // For dates older than 24 hours, display formatted date (e.g., "Mar 21, 2023")
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };



    // Utility to format the topic timestamp into a relative time
    export const formatTimestamp = (timestamp: string): string => {
        return formatRelativeTime(timestamp);
      };