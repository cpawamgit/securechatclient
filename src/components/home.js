import {
    Link,
} from "react-router-dom";

function Home(params) {
    return (
        <div className="home-wrapper"
            style={{
                height: "75%",
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
                    alignItems: "center",
                    position: "relative"
                }}
            >
                <Link 
                className="home-link"
                to="/create"><button    
                className="home-buttons"
                ><p>Create Room</p></button></Link>
                <Link 
                className="home-link"
                to="/join"><button
                className="home-buttons"
                ><p>Join Room</p></button></Link>
                <Link 
                className="home-link"
                to="/howto"><button
                className="home-buttons"
                ><p>How does it work</p></button></Link>
            </div>
        </div>
    );
}

export default Home;