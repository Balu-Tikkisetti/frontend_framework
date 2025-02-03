class UserProfile {
    username: string;
    gmail: string;
    gender: string;
    dob: string;
    profilePic: string | null;
    supporters: number;
    supported: number;
  
    constructor(
      username: string,
      gmail: string,
      gender: string,
      dob: string,
      profilePic: string | null,
      supporters: number,
      supported: number
    ) {
      this.username = username;
      this.gmail = gmail;
      this.gender = gender;
      this.dob = dob;
      this.profilePic = profilePic || null; // Handle null values properly
      this.supporters = supporters;
      this.supported = supported;
    }
  }
  
  export default UserProfile;
  