import { Bytes } from "firebase/firestore";
import "../search.css";
import axios from "axios";
import { api } from "../model/constants";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../App.css";
import CommentsSection from "./comments_section";
import ShareOverlay from "./Share_overlay";

interface PostDetails {
  user_id: string;
  post_id: string;
  username: string;
  profile_pic: Bytes;
  post_text: string;
  post_image: Bytes;
  likes_count: number;
  hashtags: string;
  _type: string;
}

interface CommentDetails {
  username: string;
  comment_text: string;
  post_id: string;
  user_id: string;
  timestamp: string;
}

interface UserDetails {
  user_id: string;
  username: string;
  profile_pic: Blob;
}

function Search() {
  const [searchResults, setSearchResults] = useState<PostDetails[] | UserDetails[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [showOverlay, setShowOverlay] = useState<boolean[]>([]);
  const [commentDetails, setCommentDetails] = useState<CommentDetails[] | null>(
    null
  );
  const [commentOpen, setCommentOpen] = useState<boolean[]>([]);

  const { user_id } = useParams();
  const navigate = useNavigate();

  const { hashtag } = useParams<{ hashtag?: string }>(); // Get the hashtag from URL params
 
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
  useEffect(() => {
    if (hashtag) {
        const inputElement = document.querySelector<HTMLInputElement>(".search-input");
        if (inputElement) {
            inputElement.value = "#" + hashtag;
            handleSearch();
        }
    }
}, [hashtag]);


  const handleSearch = async () => {

    const searchText = document.querySelector<HTMLInputElement>(".search-input")?.value;
    if (!searchText) {
      alert("You didn't enter any search text");
    } else {
      try {
        if (searchText.startsWith("#")) {
          const searchPostWord = searchText.substring(1);
          const postResponse = await axios.get(`${api}/searchPosts/${searchPostWord}`);
          setSearchResults(postResponse.data);
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
        } else {
          const userResponse = await axios.get(`${api}/searchUsers/${searchText}`);
          setSearchResults(userResponse.data);
        }
        if(searchResults!=null){
          alert("Didn't find results for the input");
        }
      } catch (error) {
        setErrorMessage(`Error: ${error}`);
      }
    }
  };
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
      const result = searchResults && searchResults[index];
      if (result && 'post_id' in result) {
        const post_id = result.post_id;
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

    const result = searchResults && searchResults[index];
      if (result && 'post_id' in result) {
        const post_id = result.post_id;
      formData.append("post_id",post_id);
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

  const toggleLike = async (post_id: string, index: number) => {
    if (likedPosts.includes(post_id)) {
      setLikedPosts(likedPosts.filter((id) => id !== post_id));
      try {
        await axios.post(`${api}/unlike/${post_id}/${user_id}`, {
          headers: {
            "Content-type": "application/json",
          },
        });

        if (Array.isArray(searchResults)) {
          const updatedPosts = [...searchResults];
          const postDetails = updatedPosts[index] as PostDetails;
          if (postDetails && 'likes_count' in postDetails) {
            postDetails.likes_count -= 1;
            setSearchResults(updatedPosts as PostDetails[]);
          }
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
        if (Array.isArray(searchResults)) {
          const updatedPosts = [...searchResults];
          const postDetails = updatedPosts[index] as PostDetails;
          if (postDetails && 'likes_count' in postDetails) {
            postDetails.likes_count += 1;
            setSearchResults(updatedPosts as PostDetails[]);
          }
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
      <div>
      <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        ></link>
        <div className="position-absolute top-0 start-50 translate-middle-x input-group mb-3 search-bar">
          <input
            type="text"
            className="form-control search-input"
            placeholder="username for profiles or #hashtags for posts"
            aria-label="username for profiles or #hashtags for posts"
            aria-describedby="button-addon2"
          />
          <button className="btn" onClick={handleSearch}>
            <i className="bi bi-search"></i>
          </button>
        </div>

        <div className="">
          {errorMessage && <p>{errorMessage}</p>}
          {searchResults && searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <div key={index} className="result-item d-flex flex-column align-items-center feeder-class">
                {result.hasOwnProperty("post_id") ? (
                  <div className="posts border border-3 shadow-sm p-3 mb-5 bg-body-tertiary rounded modal-body">
                    <table>
                <thead>
                  <tr>
                    <td>
                      <div className="profile-info-container " onClick={()=>{handleUserClick((result as PostDetails).user_id)}}>
                      {(result as PostDetails).profile_pic != null? (
                          <img
                            src={`data:image;base64,${(result as PostDetails).profile_pic}`}
                            alt=""
                            className="pic_icon"
                          />
                        ) : (
                          <i className="bi bi-person-fill"></i>
                        )}
                        <p className="user-name">{(result as PostDetails)?.username}</p>

                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="p_media_holder">
                        <div className="post-image-container">
                          <img
                            src={`data:${(result as PostDetails)._type};base64,${(result as PostDetails).post_image}`}
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
                              likedPosts.includes((result as PostDetails).post_id) ? "liked" : ""
                            }`} // Apply 'liked' class if the post is liked
                            aria-label="Like"
                            onClick={() => toggleLike((result as PostDetails).post_id, index)}
                          >
                            {likedPosts.includes((result as PostDetails).post_id) ? (
                              <i className="bi bi-heart-fill"></i>
                            ) : (
                              <i className="bi bi-heart"></i>
                            )}
                          </button>
                          <p>{(result as PostDetails).likes_count}</p>
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
                              post_id={(result as PostDetails).post_id}
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
                      {(result as PostDetails).hashtags && (
                        <div>
                          {(result as PostDetails).hashtags
                            .split(/[ ,]+/)
                            .map((hashtag, index) => (
                              <a key={index} href="">
                                #{hashtag}&nbsp;
                              </a>
                            ))}
                        </div>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{(result as PostDetails).post_text}</td>
                  </tr>
                </thead>
              </table>
                  </div>
                ) : (
                  <button
                    className="user-details btn border border-5 rounded"
                    onClick={() => handleUserClick(result.user_id)}
                  >
                    {result.profile_pic ? (
                      <img src={`data:image;base64,${result.profile_pic}`} alt="" className="pic_icon" />
                    ) : (
                      <i className="bi bi-person-fill"></i>
                    )}
                    <p>{result.username}</p>
                  </button>
                )}
              </div>
            ))
          ) : (
            <p></p>
          )}
        </div>
      </div>
    </>
  );
}

export default Search;
