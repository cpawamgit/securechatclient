import {
    HashRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
    useRouteMatch,
    useLocation,
    useParams
  } from "react-router-dom";

function Home(params) {
    return(
        <div className="home-wrapper">
            <div className="btn-wrapper">
                <Link to="/create"><button><p>Create Room</p></button></Link>
                <Link to="/join"><button><p>Join Room</p></button></Link>
                <Link to="/howto"><button><p>How does it work</p></button></Link>
            </div>
        </div>
    );
}

export default Home;