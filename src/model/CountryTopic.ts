// src/model/CountryTopic.ts

class CountryTopic {
    topicId: string; // ✅ Topic ID
    userId: number; // ✅ User ID from MySQL
    username: string; // ✅ Username of the topic creator
    profilePicture: string | null; // ✅ Profile picture (optional)
    text: string; // ✅ Topic text
    location: string; // ✅ Topic location
    timestamp: string; // ✅ Timestamp of topic creation
    topicImage?: string; // ✅ Optional image URL
  
    constructor(
      topicId: string,
      userId: number,
      username: string,
      profilePicture: string | null,
      text: string,
      location: string,
      timestamp: string,
      topicImage?: string
    ) {
      this.topicId = topicId;
      this.userId = userId;
      this.username = username;
      this.profilePicture = profilePicture || null; // Handle null values properly
      this.text = text;
      this.location = location;
      this.timestamp = timestamp;
      this.topicImage = topicImage;
    }
  }
  
  export default CountryTopic;
  