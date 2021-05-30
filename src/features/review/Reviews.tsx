// @ts-nocheck

import React, { useState, useEffect } from "react";
import { get, map, find, isEmpty, clone } from "lodash";
import moment from "moment";

import "./Review.css";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import ReactStars from "react-rating-stars-component";
import productImg from "../../logo.svg";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import ReviewForm from "../review-form/ReviewForm";
import { request } from "../../api/base";

const Review: React.FC<{}> = () => {
  const [shops, setShops] = useState([{ label: "No Option", value: 0 }]);
  const [products, setProducts] = useState([]);

  const getProducts = async (selectedOption) => {
    const result = await request.get("products", {
      params: {
        shop_id: selectedOption.value,
        per_page: 1,
      },
    });

    return get(result, "data.records");
  };

  const getReviews = async (productIds) => {
    var params = {
      product_ids: productIds,
      per_page: 1,
    };

    const result = await request.get(`reviews`, {
      params: params,
    });

    return get(result, "data.records");
  };

  const onSelect = async (selectedOption) => {
    let products = await getProducts(selectedOption);
    const productIds = map(products, "id");
    const reviews = await getReviews(productIds);

    products.map((product) => {
      const reviewProduct = find(reviews, ["product.id", product.id]);
      const productReviews = reviewProduct.reviews;
      product["reviews"] = productReviews;
      return product;
    });

    setProducts(products);
  };

  const reload = () => {
    window.location.reload();
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await request.get("shops");
      const shops = get(result, "data");
      const shopsDropdown = shops.map((shop) => {
        return { label: shop.name, value: shop.id };
      });

      setShops(shopsDropdown);
      setProducts(products);
    };

    fetchData();
  }, []);

  let match = useRouteMatch();

  const formatReviewTime = (reviewCreatedAt) => {
    const duration = moment(reviewCreatedAt).diff(moment(), "hours");
    return moment.duration(duration, "hours").humanize(true);
  };

  const renderReviews = (product) => {
    if (product.reviews.length === 0)
      return <div className="no-review">No Review</div>;

    return (
      <div>
        {product.reviews.map((review) => (
          <div>
            <div className="reviewer-info">
              <img className="reviewer-img"></img>
              <div className="reviewer-name">{review.reviewer_name}</div>
            </div>
            <div className="rating">
              <ReactStars
                count={5}
                value={review.rating}
                size={24}
                activeColor="#ffd700"
              />
              <div className="review-created-at">
                {formatReviewTime(review.created_at)}
              </div>
            </div>
            <div className="review-content">{review.body}</div>
          </div>
        ))}
        <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={Math.ceil(product.totalReviews / REVIEW_PER_PAGE)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={(selected) =>
            handleReviewPageClick({ productId: product.id, selected })
          }
          containerClassName={"pagination"}
          activeClassName={"active"}
          pageClassName={"pageClassName"}
        />
      </div>
    );
  };

  return (
    <Switch>
      <Route path="/products/:id/new-review">
        <div className="review-form-wrapper">
          <ReviewForm />
        </div>
      </Route>

      <Route path={match.path}>
        <div className="container">
          <div className="filter-container">
            <div className="filter">
              <div className="label">Filter by shop</div>
              <Dropdown
                options={shops}
                onChange={onSelect}
                value={shops[0]}
                placeholder="Select an option"
              />
            </div>
          </div>
          {products.map((product) => (
            <div className="product">
              <div className="product-info">
                <img src={productImg} className="image" alt="Product" />
                <div className="image-name">{product.title}</div>
                <Link
                  to={`products/${product.id}/new-review`}
                  className="button-new"
                >
                  New Review
                </Link>
              </div>
              <div className="review">{renderReviews(product)}</div>
            </div>
          ))}
          <button className="button-reload" onClick={reload}>
            Reload to get latest review
          </button>
        </div>
      </Route>
    </Switch>
  );
};

export default Review;
