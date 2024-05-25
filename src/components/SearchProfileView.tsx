import "../App.css";
import "../profilepage.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { api } from "../model/constants.ts";
import { useParams} from "react-router-dom";
import { Bytes } from "firebase/firestore";

import CommentsSection from "./comments_section.tsx";

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
  hastags: String;
  _type: string;
}

export interface CommentDetails {
  username: string;
  comment_text: string;
  post_id: string;
  user_id: string;
  timestamp: string;
}

function SearchProfileView() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [postDetails, setPostDetails] = useState<PostDetails[] | null>(null);
  const [profilePic, setProfilePic] = useState(null);
  const [commentDetails, setCommentDetails] = useState<CommentDetails[] | null>(
    null
  );
  const [subscribed, setSubscribed] = useState(false);

  const [commentOpen, setCommentOpen] = useState<boolean[]>([]);

 

  const { user_id, search_user_id } = useParams();
  const userId = search_user_id;

  // Function to close the comment box for a specific post
  const closeComment = (index: number) => {
    const newCommentOpen = [...commentOpen];
    newCommentOpen[index] = false;
    setCommentOpen(newCommentOpen);
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
        setPostDetails(response.data);
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

    const fetchSubscription = async () => {
      try {
        const response = await axios.get(
          `${api}/isSubscriber/${search_user_id}/${user_id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setSubscribed(response.data);
      } catch (e) {
        alert("Error while fetching the subscription details " + e);
      }
    };

    if (search_user_id) {
      fetchUserDetails();
      fetchPostDetails();
      fetchProfilePic();
      fetchSubscription();
    }
  }, [user_id, search_user_id]);

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
    const user_Id = search_user_id || "";
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

  const handleSubscription = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget as HTMLButtonElement;
    const isSubscribed = button.textContent === "Subscribe";
    if (isSubscribed) {
      button.textContent = "Unsubscribe";
      button.classList.remove("btn-primary");
      button.classList.add("btn-light");
      try {
        const subscriber_user_id = search_user_id;
        const subscribed_user_id = user_id;
        console;
        const subscriptionResponse = await axios.post(
          `${api}/updateSubscription/${subscriber_user_id}/${subscribed_user_id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(subscriptionResponse);
      } catch (error) {
        alert("Error while subscription");
      }
    } else {
      button.textContent = "Subscribe";
      button.classList.remove("btn-light");
      button.classList.add("btn-primary");

      try {
        const unsubscriber_user_id = search_user_id;
        const unsubscribed_user_id = user_id;
        const unsubscriptionResponse = await axios.post(
          `${api}/deleteSubscription/${unsubscriber_user_id}/${unsubscribed_user_id}`,
          {
            Headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(unsubscriptionResponse);
      } catch (error) {
        alert("Error while subscription");
      }
    }
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
                  </div>
                </td>
              </tr>
            </thead>
          </table>
        </header>
        <div>
          {subscribed == false ? (
            <button
              type="button"
              className="btn btn-primary subs-button"
              onClick={(e) => {
                handleSubscription(e);
              }}
            >
              Subscribe
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-light subs-button"
              onClick={(e) => {
                handleSubscription(e);
              }}
            >
              Unsubscribe
            </button>
          )}
        </div>

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
                        <img
                          src={`base`}
                          alt="Profile Icon"
                          className="post-profile-icon"
                        />
                        <p className="user-name">
                          {userDetails?.first_name +
                            " " +
                            userDetails?.last_name}
                        </p>
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
                      <div className="like-comments">
                        <button className="like-button" aria-label="Like">
                          <span className="like-icon">&#x2764;</span>
                        </button>

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
                          <span className="comment-icon">&#x1F4AC;</span>
                        </button>
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
                      {post.hastags && (
                        <div>
                          {post.hastags.split(/[ ,]+/).map((hashtag, index) => (
                            <a key={index} href="">
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

export default SearchProfileView;
