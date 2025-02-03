class Topic {
  id: String;
  userId: number | null; // ✅ Ensures consistency
  username: string; // ✅ Ensures consistency
  profilePicture: string | null; // ✅ Nullable profile picture
  text: string;
  location: string;
  timestamp: string;
  topicImage: string | null; // ✅ Nullable image

  constructor(
    id: String,
    text: string,
    location: string,
    timestamp: string,
    userId: number | null = null, // ✅ Default to null
    username: string = "Unknown", // ✅ Default to "Unknown"
    profilePicture: string | null = null, // ✅ Default to null
    topicImage: string | null = null // ✅ Default to null
  ) {
    this.id = id;
    this.userId = userId;
    this.username = username;
    this.profilePicture = profilePicture;
    this.text = text;
    this.location = location;
    this.timestamp = timestamp;
    this.topicImage = topicImage;
  }
}

export default Topic;
