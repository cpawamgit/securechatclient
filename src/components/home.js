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
    return (
        <div className="home-wrapper"
            style={{
                height: "100%",
                width: "100%",
                position: "relative"
            }}
        >
            <div className="btn-wrapper"
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Link to="/create"><button
                style={{
                    marginTop: "10vh"
                }}
                className="home-buttons"
                ><p>Create Room</p></button></Link>
                <Link to="/join"><button
                className="home-buttons"
                ><p>Join Room</p></button></Link>
                <Link to="/howto"><button
                className="home-buttons"
                ><p>How does it work</p></button></Link>
            </div>
        </div>
    );
}

export default Home;