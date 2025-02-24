class Topic {
  id: String;
  userId: number | null; 
  username: string; 
  profilePicture: string | null; 
  annotate:string;
  text: string;
  location: string;
  timestamp: string;
  topicImageUrl: string | null; 

  constructor(
    id: String,
    annotate:string,
    text: string,
    location: string,
    timestamp: string,
    userId: number | null = null, 
    username: string = "Unknown", 
    profilePicture: string | null = null, 
    topicImageUrl: string | null = null 
  ) {
    this.id = id;
    this.userId = userId;
    this.username = username;
    this.profilePicture = profilePicture;
    this.annotate=annotate;
    this.text = text;
    this.location = location;
    this.timestamp = timestamp;
    this.topicImageUrl = topicImageUrl;
  }
}

export default Topic;
