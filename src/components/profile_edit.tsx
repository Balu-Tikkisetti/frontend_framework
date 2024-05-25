import axios from "axios";
import { api } from "../model/constants";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState,useRef,ChangeEvent } from "react";
import "../components.css";
interface UserDetails {
  first_name: string;
  last_name: string;
  username: string;
  gmail: string;
  gender: string;
  dob: string;
  phone_number: string;
  password: string;
  type: string;
}
function ProfileEdit() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [profilePic, setProfilePic] = useState(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const { user_id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${api}/profile/${user_id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    const fetchProfilePic = async () => {
      try {
        const response = await axios.get(`${api}/getDp/${user_id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setProfilePic(response.data);
      } catch (e) {
        alert("error while loading the profile picture " + e);
      }
    };

    if (user_id) {
      fetchUserDetails();
      fetchProfilePic();
    }
  }, [user_id]);
  const handleFileUpload = () => {
    console.log("Entered here");
    fileInputRef.current?.click();
  };

  const handlefileselect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit=async()=>{
    const formData=new FormData();
    const new_first_name=document.querySelector<HTMLInputElement>('.first_name')?.value;
    const new_last_name=document.querySelector<HTMLInputElement>('.last_name')?.value;
    const new_username=document.querySelector<HTMLInputElement>('.username')?.value;
    const new_gmail=document.querySelector<HTMLInputElement>('.gmail')?.value;
    const new_dob=document.querySelector<HTMLInputElement>('.dob')?.value;
    const new_gender=document.querySelector<HTMLInputElement>('.gender')?.value;
    if(user_id&&new_first_name&&new_last_name&&new_username&&new_gmail&&new_dob&&new_gender){
        formData.append("user_id",user_id);
        formData.append("first_name",new_first_name);
        formData.append("last_name",new_last_name);
        formData.append("username",new_username);
        formData.append("gmail",new_gmail);
        formData.append("dob",new_dob);
        formData.append("gender",new_gender);
        if (selectedFile) {
            formData.append("file", selectedFile);
          }

        try{
            const response=await axios.post(`${api}/updateProfile`,formData,{
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
              navigate(`/college_media/${user_id}`, {
                replace: true,
              });
        }catch(e){
            alert("Error occured while updating "+e);
        }
    }else{
        alert("insufficient data to update");
    }

  }

  return (
    <>
      <div>
      <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        ></link>
        <div className="edit_area position-absolute top-50 start-50 translate-middle">
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => {
              navigate(`/college_media/${user_id}`, { replace: true });
            }}
          ></button>
          <br />
          <div className="position-absolute top-0 start-50 translate-middle-x edit_dp">
            <img
            src={
                selectedFile != null
                  ? URL.createObjectURL(selectedFile)
                  : `data:image;base64,${profilePic}`
              }
              alt=""
              style={{
                width: 150,
                height: 150,
                borderRadius: 150 / 2,
                backgroundColor: "grey",
              }}
            />
            <br />
            <button className="btn" onClick={()=>{handleFileUpload()}}>
          <i className="bi bi-upload"></i>
          </button>
          <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlefileselect}
              className="form-control"
              style={{ display: "none" }}
            />
          
          </div>
          

          <form className="row g-3 edit_form">
            <div className="col-md-6">
              <label htmlFor="inputEmail4" className="form-label">
                First Name
              </label>
              <input
                type="text"
                className="form-control first_name"
                id="inputEmail4"
                defaultValue={userDetails?.first_name||""}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="inputPassword4" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                className="form-control last_name"
                id="inputPassword4"
                defaultValue={userDetails?.last_name||""}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="username" className="form-label">
                username
              </label>
              <input
                type="text"
                className="form-control username"
                id="username"
                defaultValue={userDetails?.username||""}
                required
              />
            </div>
            <div className="col-12">
              <label htmlFor="inputAddress" className="form-label">
                Gmail
              </label>
              <input
                type="gmail"
                className="form-control gmail"
                id="inputAddress"
                placeholder=""
                defaultValue={userDetails?.gmail||""}
                disabled
              />
            </div>
            <div className="col-12">
              <label htmlFor="inputAddress2" className="form-label">
                Date of Birth
              </label>
              <input
                type="text"
                className="form-control dob"
                id="inputAddress2"
                placeholder=""
                defaultValue={userDetails?.dob||""}
                disabled
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="inputCity" className="form-label">
                Gender
              </label>
              <input
                type="text"
                className="form-control gender"
                id="inputCity"
                defaultValue={userDetails?.gender||""}
                disabled
              />
            </div>
            

            <div className="col-12">
              <button type="button" className="btn btn-primary" onClick={()=>{handleSubmit()}}>
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ProfileEdit;
