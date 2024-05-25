import axios from "axios";
import { Bytes } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../model/constants";
import { set } from "firebase/database";
import CommentsSection from "./comments_section";
import ShareOverlay from "./Share_overlay";


interface PostDetails{
post_id: string;
  user_id: string;
  username: string;
  post_text: string;
  post_base64: Bytes;
  hashtags: String;
  profile_pic: Bytes;
  timestamp: string;
  _type: string;
  likes_count: number;
}

interface CommentDetails {
    username: string;
    comment_text: string;
    post_id: string;
    user_id: string;
    timestamp: string;
  }

function NotificationPost(){
    const [postDetails, SetPostDetails] = useState<
    PostDetails
  >();

  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [commentDetails, setCommentDetails] = useState<CommentDetails[] | null>(
    null
  );
  const [showOverlay, setShowOverlay] = useState<boolean>();
  const [commentOpen, setCommentOpen] = useState<boolean>();
  const { user_id } = useParams();
  const {post_id}=useParams();
  const navigate = useNavigate();
  const handleClickHashtag = (hashtag: string) => {
  
    navigate(`/search/${user_id}/${hashtag}`);
  };

  const handleShareClick = () => {
    let newShowOverlay = showOverlay;
    newShowOverlay = true;
    setShowOverlay(newShowOverlay);
  };

  const handleCloseOverlay = () => {
    let newShowOverlay = showOverlay
    newShowOverlay = false;
    setShowOverlay(newShowOverlay);
  };

  useEffect(() => {
    
    const fetchPostDetails=async()=>{

        try{
            const response=await axios.get(`${api}/getpost/${post_id}`)
            SetPostDetails(response.data);
        }catch(e){
            console.log(e);
        }
    }

    const fetchLikesPosts = async () => {
      try {
        const response = await axios.get(`${api}/likedPosts/${user_id}`, {
          headers: {
            "Content-type": "application/type",
          },
        });
        setLikedPosts(response.data);
      } catch (e) {
        alert("Error while fetching the liked posts " + e);
      }
    };

    if (user_id) {
      fetchLikesPosts();
      fetchPostDetails();
    }
  }, [user_id]);

  const closeComment = () => {
    let newCommentOpen = commentOpen;
    newCommentOpen = false;
    setCommentOpen(newCommentOpen);
  };

  const openComment = async () => {
    let newCommentOpen = commentOpen;
    newCommentOpen = true;
    setCommentOpen(newCommentOpen);

    try {
      if (postDetails) {
        const post_id = postDetails.post_id;
        const response = await axios.get(`${api}/getComments/${post_id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setCommentDetails(response.data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const submitComment = async () => {
   
    const commentValue = (
      document.getElementById("newComment") as HTMLInputElement
    )?.value;
    const user_Id = user_id || "";
    const formData = new FormData();
    const timestamp = new Date().toLocaleString();

    if (postDetails) {
      formData.append("post_id",postDetails.post_id);
    }

    formData.append("user_id", user_Id);
    formData.append("comment_text", commentValue);
    formData.append("timestamp", timestamp);
    try {
      const response = await axios.post(api + "/saveComment", formData);
      console.log("Comment saved:", response.data);
    } catch (error) {
      console.error("Error saving comment:", error);
    }

    
    closeComment();
  };

  const toggleLike = async (post_id: string) => {
    if (likedPosts.includes(post_id)) {
      setLikedPosts(likedPosts.filter((id) => id !== post_id));
      try {
        await axios.post(`${api}/unlike/${post_id}/${user_id}`, {
          headers: {
            "Content-type": "application/json",
          },
        });

        if(postDetails){
        postDetails.likes_count -= 1;
        SetPostDetails(postDetails);
        }
      } catch (e) {
        alert("Error while deleting the like " + e);
      }
    } else {
      setLikedPosts([...likedPosts, post_id]);
      try {
        await axios.post(`${api}/like/${post_id}/${user_id}`, {
          headers: {
            "Content-type": "application/json",
          },
        });
        if(postDetails){
        postDetails.likes_count += 1;
        SetPostDetails(postDetails);
        }
      } catch (e) {
        alert("Error while liking the post " + e);
      }
    }
  };

  const handleUserClick = (searchUserId: string) => {
    navigate(`/search_profile_view/${user_id}/${searchUserId}`);
  };

  return (
    <>
      <div className="d-flex flex-column align-items-center feeder-class">
        {postDetails && (
          <div
            className="posts border border-3 shadow-sm p-3 mb-5 bg-body-tertiary rounded modal-body"
          >
            <table>
              <thead>
                <tr>
                  <td>
                    <div
                      className="profile-info-container"
                      onClick={() => {
                        handleUserClick(postDetails.user_id);
                      }}
                    >
                      {postDetails.profile_pic != null ? (
                        <img
                          src={`data:image;base64,${postDetails.profile_pic}`}
                          alt=""
                          className="pic_icon"
                        />
                      ) : (
                        <i className="bi bi-person-fill"></i>
                      )}
                      <p className="user-name">{postDetails.username}</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="p_media_holder">
                      <div className="post-image-container">
                        <img
                          src={`data:${postDetails._type};base64,${postDetails.post_base64}`}
                          alt=""
                          className="p_image"
                        />
                      </div>
                      {/* {postDetails._type.startsWith("image") ? (
                
                        ) : postDetails._type.startsWith("video") ? (
                          <video controls>
                            <source
                              src={`data:${postDetails._type};base64,${postDetails.post_base64}`}
                              type={postDetails._type}
                            />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <p>Unsupported file format</p>
                        )} */}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="like-comments-share">
                      <div className="button-wrapper">
                        <button
                          className={`like-button btn ${
                            likedPosts.includes(postDetails.post_id)
                              ? "liked"
                              : ""
                          }`} // Apply 'liked' class if the post is liked
                          aria-label="Like"
                          onClick={() => toggleLike(postDetails.post_id)}
                        >
                          {likedPosts.includes(postDetails.post_id) ? (
                            <i className="bi bi-heart-fill"></i>
                          ) : (
                            <i className="bi bi-heart"></i>
                          )}
                        </button>
                        <p>{postDetails.likes_count}</p>
                      </div>
                      <div className="button-wrapper">
                        <button
                          className="comment-button"
                          aria-label="Comment"
                          onClick={() => {
                            if (commentOpen) {
                              closeComment();
                            } else {
                              openComment();
                            }
                          }}
                        >
                          <i className="bi bi-chat-dots"></i>
                        </button>
                      </div>
                      <div className="button-wrapper">
                        <button
                          className="btn share-button"
                          onClick={() => handleShareClick()}
                        >
                          <i className="bi bi-send"></i>
                        </button>
                        {showOverlay && user_id && (
                          <ShareOverlay
                            onClose={() => handleCloseOverlay()}
                            post_id={postDetails.post_id}
                            user_id={user_id}
                          />
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    {commentOpen && (
                      <div>
                        {commentDetails?.map((comment, commentIndex) => (
                          <CommentsSection
                            key={commentIndex}
                            commentDetails={comment}
                          />
                        ))}
                        <div className="comment-box">
                          <div className="input-group mb-3">
                            <input
                              type="text"
                              id="newComment"
                              className="form-control"
                              placeholder="write a comment"
                              aria-label="write a comment"
                              aria-describedby="button-addon2"
                            />
                            <button
                              className="btn btn-primary"
                              type="button"
                              id="comment_post"
                              onClick={() => submitComment()}
                            >
                              comment
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    {postDetails.hashtags && (
                      <div>
                        {postDetails.hashtags
                          .split(/[ ,]+/)
                          .map((hashtag, index) => (
                            <a
                              key={index}
                              href=""
                              onClick={() => handleClickHashtag(hashtag)}
                            >
                              #{hashtag}&nbsp;
                            </a>
                          ))}
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>{postDetails.post_text}</td>
                </tr>
              </thead>
            </table>
          </div>
        )}
      </div>
    </>
  );
  
}

export default NotificationPost;