import axios from "axios";
import { Bytes } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../model/constants";
import CommentsSection from "./comments_section";
import "../App.css"
import "../profilepage.css"
import ShareOverlay from "./Share_overlay";


interface RandomPosts{
  post_id: string;
  user_id: string;
  username: string;
  post_text: string;
  post_image: Bytes;
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



function Random() {
const [randomPosts,setRandomPosts]=useState<RandomPosts[]|null>(null);
const [likedPosts, setLikedPosts] = useState<string[]>([]);
const [showOverlay, setShowOverlay] = useState<boolean[]>([]);
  const [commentDetails, setCommentDetails] = useState<CommentDetails[] | null>(
    null
  );
  const [commentOpen, setCommentOpen] = useState<boolean[]>([]);

const {user_id}=useParams();
const navigate = useNavigate();
const handleShareClick = (index: number) => {
  const newShowOverlay = [...showOverlay];
  newShowOverlay[index] = true;
  setShowOverlay(newShowOverlay);
};

const handleCloseOverlay = (index: number) => {
  const newShowOverlay = [...showOverlay];
  newShowOverlay[index] = false;
  setShowOverlay(newShowOverlay);
};
const handleClickHashtag = (hashtag: string) => {
  
  navigate(`/search/${user_id}/${hashtag}`);
};
  
useEffect(()=>{
  const fetchRandomPosts=async()=>{
    try{
      const response=await axios.get(`${api}/getRandomPosts/${user_id}`)
      setRandomPosts(response.data);
    }catch(e){
      alert("Error while loaing random posts "+e);
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
  if(user_id){
    fetchRandomPosts();
  }

},[user_id])
const closeComment = (index: number) => {
  const newCommentOpen = [...commentOpen];
  newCommentOpen[index] = false;
  setCommentOpen(newCommentOpen);
};

const openComment = async (index: number) => {
  const newCommentOpen = [...commentOpen];
  newCommentOpen[index] = true;
  setCommentOpen(newCommentOpen);

  try {
    if (randomPosts && randomPosts[index]) {
      const post_id = randomPosts[index].post_id;
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

const submitComment = async (index: number) => {
  const commentInputId = `comment-${index}`;
  const commentValue = (
    document.getElementById(commentInputId) as HTMLInputElement
  )?.value;
  const user_Id = user_id || "";
  const formData = new FormData();
  const timestamp = new Date().toLocaleString();

  if (randomPosts && randomPosts[index]) {
    formData.append("post_id", randomPosts[index].post_id);
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

  // Reset the comment input field and close the comment box
  closeComment(index);
};
const toggleLike = async (post_id: string) => {
  console.log(post_id);
  if (likedPosts.includes(post_id)) {
    setLikedPosts(likedPosts.filter((id) => id !== post_id));
    try {
      const response = await axios.post(
        `${api}/unlike/${post_id}/${user_id}`,
        {
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      console.log(response);
    } catch (e) {
      alert("Error while deleting the like " + e);
    }
  } else {
    setLikedPosts([...likedPosts, post_id]);

    try {
      const response = await axios.post(`${api}/like/${post_id}/${user_id}`, {
        headers: {
          "Content-type": "application/json",
        },
      });
      console.log(response);
    } catch (e) {
      alert("Error while liking the post " + e);
    }
  }
};

const handleUserClick = (searchUserId: string) => {
  navigate(`/search_profile_view/${user_id}/${searchUserId}`);
};

if(!randomPosts){
  return (
    <div className="d-flex justify-content-center position-absolute top-50 start-50 translate-middle">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
  return (
    <>
     <div className="container text-center">
     <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        ></link>
      <div className="row row-cols-2">
        {randomPosts?.map((post, index) => (
          <div
            className="  col posts border border-3 shadow-sm p-3 mb-5 bg-body-tertiary rounded modal-body"
            key={index}
          >
            <table>
              <thead>
                <tr>
                  <td>
                    <div className="profile-info-container" onClick={()=>{handleUserClick(post.user_id)}}>
                    {post.profile_pic != null? (
                          <img
                            src={`data:image;base64,${post.profile_pic}`}
                            alt=""
                            className="pic_icon"
                          />
                        ) : (
                          <i className="bi bi-person-fill"></i>
                        )}
                      <p className="user-name">{post?.username}</p>
                     
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="p_media_holder">
                      <div className="post-image-container">
                        <img
                          src={`data:${post._type};base64,${post.post_image}`}
                          alt={`Post ${index}`}
                          className="p_image"
                        />
                      </div>
                      {/* {post._type.startsWith("image") ? (
              
                        ) : post._type.startsWith("video") ? (
                          <video controls>
                            <source
                              src={`data:${post._type};base64,${post.post_image}`}
                              type={post._type}
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
                            likedPosts.includes(post.post_id) ? "liked" : ""
                          }`} // Apply 'liked' class if the post is liked
                          aria-label="Like"
                          onClick={() => toggleLike(post.post_id)}
                        >
                          {likedPosts.includes(post.post_id) ? (
                            <i className="bi bi-heart-fill"></i>
                          ) : (
                            <i className="bi bi-heart"></i>
                          )}
                        </button>
                        <p>{post.likes_count}</p>
                      </div>
                      <div className="button-wrapper">
                        <button
                          className="comment-button"
                          aria-label="Comment"
                          onClick={() => {
                            if (commentOpen[index]) {
                              closeComment(index);
                            } else {
                              openComment(index);
                            }
                          }}
                        >
                          <i className="bi bi-chat-dots"></i>
                        </button>
                      </div>
                      <div className="button-wrapper">
                          <button
                            className="btn share-button"
                            onClick={() => handleShareClick(index)}
                          >
                            <i className="bi bi-send"></i>
                          </button>
                          {showOverlay[index] && user_id && (
                            <ShareOverlay
                              onClose={() => handleCloseOverlay(index)}
                              post_id={post.post_id}
                              user_id={user_id}
                            />
                          )}
                        </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    {commentOpen[index] && (
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
                              id={`comment-${index}`}
                              className="form-control"
                              placeholder="write a comment"
                              aria-label="write a comment"
                              aria-describedby="button-addon2"
                            />
                            <button
                              className="btn btn-primary"
                              type="button"
                              id="comment_post"
                              onClick={() => submitComment(index)}
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
                    {post.hashtags && (
                      <div>
                        {post.hashtags.split(/[ ,]+/).map((hashtag, index) => (
                          <a key={index} href=""  onClick={() => handleClickHashtag(hashtag)}>
                            #{hashtag}&nbsp;
                          </a>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>{post.post_text}</td>
                </tr>
              </thead>
            </table>
          </div>
        ))}
      </div>
    </div>
      
    </>
  )
}


export default Random;
