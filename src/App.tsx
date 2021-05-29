// @ts-nocheck

import "./App.css";
import Review from "./features/review/Reviews";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/">
            <Review />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
