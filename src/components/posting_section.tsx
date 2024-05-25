import  { useRef, ChangeEvent, useState,  } from "react";
import axios from "axios";
import "../App.css";
import { api } from "../model/constants.ts";


function Postings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    } 
      
  };
  const convertTextToImage = async (): Promise<File | null> => {
    console.log("Entered convertTextToImage");
  
    const textPreview = document.querySelector<HTMLInputElement>(".text-preview")?.value;
  
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
  
    if (textPreview && context) {
      canvas.width = 200; // Set the width as needed
      canvas.height = 200; // Set the height as needed
  
      context.font = "20px Arial";
      context.fillStyle = "black";
      context.textAlign = "center";
      context.textBaseline = "middle";
  
      context.fillText(textPreview, canvas.width / 2, canvas.height / 2);
  
      return new Promise<File>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "text-as-image.png", {
              type: "image/png",
            });
  
            console.log("Generated file:", file);
            resolve(file);
          } else {
            
          }
        }, "image/png");
      });
    }
  
    return null;
  };

  const handlePost = async () => {
    const generatedFile = await convertTextToImage();
    if (generatedFile || selectedFile) {
      await handleSubmit(generatedFile);
    }
  };
  
  

  // Render selected image or video
  const renderMedia = () => {
    if (!selectedFile) {
      return (
        <input
          className="text-preview"
          id="textPreview"
          contentEditable={true}
        />
      );
    }

    if (selectedFile.type.startsWith("image")) {
      return (
        <img
          src={URL.createObjectURL(selectedFile)}
          alt="Selected Image"
          className="image-selected"
        />
      );
    } else if (selectedFile.type.startsWith("video")) {
      return (
        <video className="video-selected" controls>
          <source
            src={URL.createObjectURL(selectedFile)}
            type={selectedFile.type}
          />
          Your browser does not support the video tag.
        </video>
      );
    }

    return null;
  };

  const handleCancel = () => {
    console.log("entered2");
    clearingData();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  function clearingData() {
    console.log("entered");
    const floatingTextarea =
      document.querySelector<HTMLInputElement>("#floatingTextarea");
    const floatingTextarea2 =
      document.querySelector<HTMLInputElement>("#floatingTextarea2");
    const renderingArea = document.querySelector("#rendering-area");

    if (floatingTextarea) {
      floatingTextarea.value = "";
    }

    if (floatingTextarea2) {
      floatingTextarea2.value = "";
    }

    if (renderingArea) {
    
      setSelectedFile(null);
    }
  }

  const handleSubmit = async (generatedFile: File | null) => {
    try {
      // Prepare the data to send to the server
      const formData = new FormData();
      const url = window.location.href;
      const userId = url.substring(url.lastIndexOf("/") + 1); 
      // Extract user ID from URL
      if (!selectedFile && generatedFile) {
        formData.append("file",generatedFile);
        setSelectedFile(generatedFile);
      }
      else if(selectedFile?.type.startsWith("video")) {
        formData.append("file", selectedFile); // Assuming it's a video file
      } else if (selectedFile?.type.startsWith("image")) {
        formData.append("file", selectedFile); // Assuming it's an image file
      }
      

      const floatingTextarea =
        document.querySelector<HTMLInputElement>("#floatingTextarea");
      const floatingTextarea2 =
        document.querySelector<HTMLInputElement>("#floatingTextarea2");

      let hashtags = "";
      let description = "";
      if (floatingTextarea) {
        hashtags = floatingTextarea.value;
      }
      if (floatingTextarea2) {
        description = floatingTextarea2.value;
      }
      const timestamp = new Date().toLocaleString();
      formData.append("user_id", userId);
      formData.append("hashtags", hashtags);
      formData.append("description", description);
      formData.append("timestamp",timestamp);

      // Make the POST request to the API endpoint
      const response = await axios.post(api + "/postings", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response from server:", response.data);
      clearingData();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="position-absolute top-50 start-50 translate-middle posting-whole-area">
      <div className="form-floating mb-3 posting-div position-relative">
        {/* Paperclip icon */}
        <button className="position-absolute bottom-0 start-0">
          <span className="paperclip-icon " onClick={handleFileUpload}>
            &#128206;
          </span>
        </button>
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*,video/*" // Accept both images and videos
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        {/* Render selected media */}
        <div id="rendering-area">{renderMedia()}</div>
      </div>
      {/*hashtags*/}
      <div className="form-floating">
        <textarea
          className="form-control"
          placeholder="Leave a comment here"
          id="floatingTextarea"
        ></textarea>
        <label htmlFor="floatingTextarea">#hashtag</label>
      </div>
      {/* description */}
      <div className="form-floating description">
        <textarea
          className="form-control description-input"
          placeholder=""
          id="floatingTextarea2"
          style={{ height: "100px" }}
        ></textarea>
        <label htmlFor="floatingTextarea2">Description</label>
      </div>
      <div>
        <button type="button" className="btn btn-danger" onClick={handleCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handlePost}
        >
          Post
        </button>
      </div>
    </div>
  );
}

export default Postings;
