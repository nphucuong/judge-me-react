// @ts-nocheck

import React, { useState, useEffect } from "react";
import "./ReviewForm.css";
import ReactStars from "react-rating-stars-component";
import { useHistory, useParams } from "react-router";
import { get } from "lodash";
import { request } from "../../api/base";

const ReviewForm: React.FC<{}> = () => {
  const [product, setProduct] = useState({ shop: { name: "" } });
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [reviewerName, setReviewerName] = useState("");

  let { id } = useParams();
  let history = useHistory();

  const ratingChanged = (newRating: number) => {
    setRating(newRating);
  };

  const onChangeBody = (event) => {
    setBody(event.target.value);
  };

  const onChangeReviewerName = (event) => {
    setReviewerName(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await request.get(`products/${id}`);
      setProduct(result.data);
    };

    fetchData();
  }, []);

  const onSubmit = () => {
    request.post("reviews", {
      product_id: product.id,
      rating: rating,
      reviewer_name: reviewerName,
      body: body,
    });

    history.goBack();
  };

  return (
    <div className="review-form-container">
      <div className="information">
        <div className="column">
          <div className="label">Shop Name:</div>
          <div className="content">{get(product, "shop.name", "No name")}</div>
        </div>
        <div className="column">
          <div className="label">Product Name:</div>
          <div className="content">{get(product, "title", "No name")}</div>
        </div>
      </div>

      <div className="section">
        <div className="label">Rating</div>
        <ReactStars
          count={5}
          onChange={ratingChanged}
          size={24}
          activeColor="#ffd700"
        />
      </div>

      <div className="section">
        <div className="label">Name</div>
        <input onChange={onChangeReviewerName} placeholder="Enter your name" />
      </div>

      <div className="section">
        <div className="label">Review</div>
        <textarea
          onChange={onChangeBody}
          placeholder="Write your reviews here"
        />
      </div>

      <button onClick={onSubmit} className="button">
        Submit Review
      </button>
    </div>
  );
};

export default ReviewForm;
