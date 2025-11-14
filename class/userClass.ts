export interface UserProfile {
  username: string;
  email: string;
  full_name: string;
  gender: "male" | "female" | "other" | "prefer not to say";
  profile_picture: string;
  age: number;
  phone_number: string;
  // DOB: string;
  password: string;
  // address: String;
}