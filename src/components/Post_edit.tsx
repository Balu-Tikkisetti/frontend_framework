import axios from "axios";
import { useEffect, ChangeEvent, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../model/constants";
import "../App.css";
import "../components.css";

interface PostDetails {
  post_id: string;
  user_id: string;
  post_text: string;
  timestamp: string;
  post_base64: string;
  hashtags: string;
  changes_on: string;
}

function PostEdit() {
  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { post_id } = useParams();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await axios.get(`${api}/getpost/${post_id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setPostDetails(response.data);
      } catch (e) {
        alert(e);
      }
    };
    if (post_id) {
      fetchPostDetails();
    }
  }, [post_id]);

  if (!postDetails) {
    return (
      <div className="d-flex justify-content-center position-absolute top-50 start-50 translate-middle">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const handleFileUpload = () => {
    console.log("Entered here");
    fileInputRef.current?.click();
  };

  const handlefileselect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("Entered here 2");
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    const hashtags =document.querySelector<HTMLInputElement>(".hashtags")?.value;
    const description =document.querySelector<HTMLInputElement>(".description")?.value;
    const currentImageUrl = selectedFile? URL.createObjectURL(selectedFile): "";
    const postImageUrl = postDetails? `data:image;base64,${postDetails.post_base64}`: "";
    if (hashtags !=postDetails.hashtags ||description !=postDetails.post_text ||currentImageUrl != postImageUrl
    ) {
        const changeTime=new Date().toLocaleString();

        formData.append("changed_on", changeTime);
        if(post_id&&description&&hashtags){
        formData.append("post_id", post_id);
        formData.append("post_text", description);
        formData.append("hashtags", hashtags);
        }
    
        
        if (selectedFile) {
            formData.append("file", selectedFile);
        }
    

    try {
      const response = await axios.post(`${api}/updatepost`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate(`/college_media/${postDetails.user_id}`, {
        replace: true,
      });
    } catch (error) {
      // Handle error
      console.error("Error updating post:", error);
    }
}
 else{
    navigate(`/college_media/${postDetails.user_id}`, {
        replace: true,
      });
 }
  };

  return (
    <>
      <div>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        ></link>
        <div className="position-absolute top-50 start-50 translate-middle post-edit-container">
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => {
              navigate(`/college_media/${postDetails.user_id}`, {
                replace: true,
              });
            }}
          ></button>
          <div className="post-edit-image-container">
            <img
              src={
                selectedFile != null
                  ? URL.createObjectURL(selectedFile)
                  : `data:image;base64,${postDetails?.post_base64}`
              }
              alt=""
              className="p_image"
            />
          </div>
          <div>
            <button className="btn" onClick={handleFileUpload}>
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
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              #
            </span>
            <input
              type="text"
              className="form-control hashtags"
              placeholder="hashtags"
              aria-label="hashtags"
              aria-describedby="basic-addon1"
              defaultValue={postDetails?.hashtags || ""}
            />
          </div>
          <div className="input-group">
            <span className="input-group-text">Description</span>
            <textarea
              className="form-control description"
              aria-label="With textarea"
              defaultValue={postDetails?.post_text || ""}
            ></textarea>
          </div>
          <div className="col-12">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostEdit;
