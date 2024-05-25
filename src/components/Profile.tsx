import "../App.css";
import "../profilepage.css";
import "../components.css";
import { useState, useEffect} from "react";
import axios from "axios";
import { api } from "../model/constants";
import { useParams, useNavigate } from "react-router-dom";
import { Bytes } from "firebase/firestore";

import CommentsSection from "./comments_section.tsx";
import ShareOverlay from "./Share_overlay.tsx";


interface UserDetails {
  first_name: string;
  last_name: string;
  gmail: string;
  phone_number: string;
  type: string;
  username: string;
  subscribed: number;
  subscribers: number;
}

interface PostDetails {
  postId: string;
  postText: string;
  filebyte: Bytes;
  timestamp: string;
  hastags: String;
  likes_count: number;
  _type: string;
}

export interface CommentDetails {
  username: string;
  comment_text: string;
  post_id: string;
  user_id: string;
  timestamp: string;
}

function Profile() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [postDetails, setPostDetails] = useState<PostDetails[]>([]);
  const [profilePic, setProfilePic] = useState(null);
  const [commentDetails, setCommentDetails] = useState<CommentDetails[] | null>(
    null
  );
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  const [commentOpen, setCommentOpen] = useState<boolean[]>([]);

  const [isDropdownOpen, setIsOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState<boolean[]>([]);
  const { user_id } = useParams();
  const handleClickHashtag = (hashtag: string) => {
  
    navigate(`/search/${user_id}/${hashtag}`);
  };

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

  const toggleDropdown = () => {
    setIsOpen(!isDropdownOpen);
  };

  
  const navigate = useNavigate();

  const userId = user_id;
  // Function to close the comment box for a specific post
  const closeComment = (index: number) => {
    const newCommentOpen = [...commentOpen];
    newCommentOpen[index] = false;
    setCommentOpen(newCommentOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");

    navigate("/", { replace: true });
  };

  const handleEditProfile = () => {
    navigate(`/profile_edit/${user_id}`);
  };

  const handlePostEdit = (post_id: string) => {
    navigate(`/post_edit/${post_id}`);
  };

  const handleDelete = async (post_id: string) => {
    if (window.confirm("Do you really want to delete the post?")) {
      try {
        const response = await axios.delete(`${api}/deletePost/${post_id}`);

        const { data } = response;
        alert(data);
        window.location.reload();
      } catch (error) {
        alert("Error while deleting the post: " + error);
      }
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${api}/profile/${userId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    const fetchPostDetails = async () => {
      try {
        const response = await axios.get(`${api}/getPosts/${userId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const formattedPosts = response.data.map((post: PostDetails) => ({
          ...post,
          timestamp: new Date(post.timestamp),
        }));

        const sortedPosts = formattedPosts.sort(
          (a: PostDetails, b: PostDetails) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setPostDetails(sortedPosts);
        setShowOverlay(Array(postDetails?.length || 0).fill(false));

        setCommentOpen(Array(response.data?.length || 0).fill(false));
      } catch (e) {}
    };

    const fetchProfilePic = async () => {
      try {
        const response = await axios.get(`${api}/getDp/${userId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setProfilePic(response.data);
      } catch (e) {
        alert("error while loading the profile picture " + e);
      }
    };

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
      fetchUserDetails();
      fetchPostDetails();
      fetchProfilePic();
      fetchLikesPosts();
    }
  }, [user_id]);

  const toggleLike = async (post_id: string, index: number) => {
    if (likedPosts.includes(post_id)) {
      setLikedPosts(likedPosts.filter((id) => id !== post_id));
      try {
        await axios.post(`${api}/unlike/${post_id}/${user_id}`, {
          headers: {
            "Content-type": "application/json",
          },
        });

        const updatedPosts = [...postDetails];
        updatedPosts[index].likes_count -= 1;
        setPostDetails(updatedPosts);
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
        // Update the like count
        const updatedPosts = [...postDetails];
        updatedPosts[index].likes_count += 1;
        setPostDetails(updatedPosts);
      } catch (e) {
        alert("Error while liking the post " + e);
      }
    }
  };



  if (!postDetails) {
    return (
      <div className="d-flex justify-content-center position-absolute top-50 start-50 translate-middle">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  const openComment = async (index: number) => {
    const newCommentOpen = [...commentOpen];
    newCommentOpen[index] = true;
    setCommentOpen(newCommentOpen);

    try {
      const post_id = postDetails[index].postId;
      const response = await axios.get(`${api}/getComments/${post_id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setCommentDetails(response.data);
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
    formData.append("post_id", postDetails[index].postId);
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

  return (
    <>
      <div>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        ></link>
        <header>
          <table>
            <thead>
              <tr>
                <td style={{ backgroundColor: "" }}>
                  <h1>Subscribed</h1>
                  <p>
                    {userDetails?.subscribed == null
                      ? 0
                      : userDetails?.subscribed}
                  </p>
                </td>
                <td style={{ backgroundColor: "" }}>
                  <h1>postings</h1>
                  <p>{postDetails.length}</p>
                </td>

                <td style={{ backgroundColor: "" }}>
                  <h1>Subscribers</h1>
                  <p>
                    {userDetails?.subscribers == null
                      ? 0
                      : userDetails?.subscribers}
                  </p>
                </td>
                <td>
                  <div style={{ backgroundColor: "" }}>
                    {profilePic != null ? (
                      <img
                        src={`data:image;base64,${profilePic}`}
                        alt=""
                        style={{
                          width: 150,
                          height: 150,
                          borderRadius: 150 / 2,
                          backgroundColor: "grey",
                        }}
                      />
                    ) : (
                      <img
                        src="../images/profileIcon.jpg"
                        alt=""
                        style={{
                          width: 150,
                          height: 150,
                          borderRadius: 150 / 2,
                          backgroundColor: "grey",
                        }}
                      />
                    )}

                    <h3>
                      {userDetails
                        ? userDetails.first_name + " " + userDetails.last_name
                        : "Loading..."}
                    </h3>
                    <p>{userDetails ? userDetails.gmail : "Loading..."}</p>
                    <p>
                      {userDetails ? userDetails.phone_number : "Loading..."}
                    </p>
                    <p>{userDetails ? userDetails.type : "Loading..."}</p>
                    <button
                      type="button"
                      className="btn"
                      data-bs-toggle="modal"
                      data-bs-target="#staticBackdrop"
                      onClick={() => {
                        handleEditProfile();
                      }}
                    >
                      <i className="bi bi-pencil-fill edit_profile"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </thead>
          </table>
        </header>
        <button onClick={handleLogout}>Logout</button>

        {/* posts area */}

        <div className="d-flex flex-column align-items-center feeder-class">
          {postDetails?.map((post, index) => (
            <div
              className="posts border border-3 shadow-sm p-3 mb-5 bg-body-tertiary rounded modal-body"
              key={index}
            >
              <table>
                <thead>
                  <tr>
                    <td>
                      <div className="profile-info-container">
                        {profilePic != null && profilePic !== "" ? (
                          <img
                            src={`data:image;base64,${profilePic}`}
                            alt=""
                            className="pic_icon"
                          />
                        ) : (
                          <i className="bi bi-person-fill"></i>
                        )}
                        <p className="user-name">{userDetails?.username}</p>
                        <div className="dropdown-container">
                          <button className="btn" onClick={toggleDropdown}>
                            <i className="bi bi-three-dots"></i>
                          </button>
                          {isDropdownOpen && (
                            <div className="dropdown-content">
                              <button
                                onClick={() => {
                                  handlePostEdit(post.postId);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDelete(post.postId);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="p_media_holder">
                        {post._type.startsWith("image") ? (
                          <div className="post-image-container">
                            <img
                              src={`data:${post._type};base64,${post.filebyte}`}
                              alt={`Post ${index}`}
                              className="p_image"
                            />
                          </div>
                        ) : post._type.startsWith("video") ? (
                          <video controls>
                            <source
                              src={`data:${post._type};base64,${post.filebyte}`}
                              type={post._type}
                            />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <p>Unsupported file format</p>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="like-comments-share">
                        <div className="button-wrapper">
                          <button
                            className={`like-button btn ${
                              likedPosts.includes(post.postId) ? "liked" : ""
                            }`}
                            aria-label="Like"
                            onClick={() => toggleLike(post.postId, index)}
                          >
                            {likedPosts.includes(post.postId) ? (
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
                              post_id={post.postId}
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
                        <div className="comment-space">
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
                      {post.hastags && (
                        <div>
                          {post.hastags.split(/[ ,]+/).map((hashtag, index) => (
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
                    <td>{post.postText}</td>
                  </tr>
                </thead>
              </table>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Profile;
