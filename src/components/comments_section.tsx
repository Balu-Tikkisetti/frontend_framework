import "../components.css";
import React from "react";
import { CommentDetails } from "./Profile";

interface CommentProps {
  commentDetails: CommentDetails;
}

const CommentsSection: React.FC<CommentProps> = ({ commentDetails }) => {
  return (
    <>
      <div>
        <div className="comment-card">
          <ul className="list-group list-group-flush">
            <a className="comment-details">
              {commentDetails.username} <span>{commentDetails.timestamp}</span>
            </a>
            <li className="list-group-item">{commentDetails.comment_text}</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default CommentsSection;
