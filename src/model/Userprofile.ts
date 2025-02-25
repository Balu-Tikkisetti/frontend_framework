class UserProfile {
  username: string;
  gmail: string;
  password: string;
  dob: string;
  gender: string;
  profilePicture: string | null;
  phoneNumber: string;
  supporters: number;
  supported: number;

  constructor(
    username: string,
    gmail: string,
    password: string,
    dob: string,
    gender: string,
    profilePicture: string | null,
    phoneNumber: string,
    supporters: number,
    supported: number
  ) {
    this.username = username;
    this.gmail = gmail;
    this.password = password;
    this.dob = dob;
    this.gender = gender;
    this.profilePicture = profilePicture ?? null;
    this.phoneNumber = phoneNumber;
    this.supporters = supporters;
    this.supported = supported;
  }
}

export default UserProfile;
