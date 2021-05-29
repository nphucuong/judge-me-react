// @ts-nocheck

import React, { useState, useEffect } from "react";
import { get, map, find, isEmpty, clone } from "lodash";

import "./Review.css";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import ReactStars from "react-rating-stars-component";
import productImg from "../../logo.svg";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import ReviewForm from "../review-form/ReviewForm";
import { request } from "../../api/base";
import ReactPaginate from "react-paginate";

const PRODUCT_PER_PAGE = 2;
const REVIEW_PER_PAGE = 2;

const Review: React.FC<{}> = () => {
  const [shops, setShops] = useState([{ label: "No Shop", value: 0 }]);
  const [selectedShopId, setSelectedShopId] = useState(0);
  const [products, setProducts] = useState([]);
  const [totalProduct, setTotalProduct] = useState(0);

  const getReviews = async (productIds, page = 0) => {
    var params = {
      product_ids: productIds,
      per_page: REVIEW_PER_PAGE,
      page: page,
    };

    const result = await request.get(`reviews`, {
      params: params,
    });

    return get(result, "data.records");
  };

  const getProducts = async (shopId, page = 0) => {
    const result = await request.get("products", {
      params: {
        shop_id: shopId,
        per_page: PRODUCT_PER_PAGE,
        page: page,
      },
    });

    let products = get(result, "data.records");
    const productIds = map(products, "id");
    const reviews = await getReviews(productIds);

    products.map((product) => {
      const reviewProduct = find(reviews, ["product.id", product.id]);
      const productReviews = reviewProduct.reviews;
      product["reviews"] = productReviews;
      product["totalReviews"] = reviewProduct.total_reviews;
      return product;
    });

    setTotalProduct(get(result, "data.total"));
    return products;
  };

  const onSelect = async (selectedOption) => {
    let products = await getProducts(selectedOption.value);

    setProducts(products);
    setSelectedShopId(selectedOption.value);
  };

  const handlePageClick = async ({ selected: selectedPage }) => {
    let products = await getProducts(selectedShopId, selectedPage);
    setProducts(products);
  };

  const handleReviewPageClick = async ({ productId, selected }) => {
    const { selected: selectedPage } = selected;

    const reviews = await getReviews([productId], selectedPage);

    let cloneProducts = clone(products);
    cloneProducts.map((product) => {
      const reviewProduct = find(reviews, ["product.id", product.id]);
      if (!isEmpty(reviewProduct)) {
        const productReviews = reviewProduct.reviews;
        product["reviews"] = productReviews;
      }
      return product;
    });

    setProducts(cloneProducts);
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await request.get("shops");
      const shops = get(result, "data.records");
      const shopsDropdown = shops.map((shop) => {
        return { label: shop.name, value: shop.id };
      });
      const shopId = shopsDropdown[0].value;
      const products = await getProducts(shopId);

      console.log(
        "🚀 ~ file: Reviews.tsx ~ line 105 ~ fetchData ~ products",
        products
      );

      setShops(shopsDropdown);
      setProducts(products);
      setSelectedShopId(shopId);
    };

    fetchData();
  }, []);

  let match = useRouteMatch();

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
              <div className="review">
                {product.reviews.map((review) => (
                  <div>
                    <div className="reviewer-info">
                      <img className="reviewer-img"></img>
                      <div className="reviewer-name">
                        {review.reviewer_name}
                      </div>
                    </div>
                    <div className="rating">
                      <ReactStars
                        count={5}
                        value={review.rating}
                        size={24}
                        activeColor="#ffd700"
                      />
                      <div className="review-created-at">1 month ago</div>
                    </div>
                    <div className="content">{review.body}</div>
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
            </div>
          ))}
          <div className="paginate">
            <ReactPaginate
              previousLabel={"previous"}
              nextLabel={"next"}
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={Math.ceil(totalProduct / PRODUCT_PER_PAGE)}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={"pagination"}
              activeClassName={"active"}
              pageClassName={"pageClassName"}
            />
          </div>
        </div>
      </Route>
    </Switch>
  );
};

export default Review;
