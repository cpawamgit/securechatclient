import { useHistory } from "react-router-dom";

const capstyle = {
    color: 'lightgreen',
    fontSize: "calc(2vh + 2vw)"
}

const lowstyle = {
    color: 'lightgreen',
    fontSize: "calc(1vh + 1vw)",
    paddingBottom: "0.5vh"
}

const wordstyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end"
}


function Title() {

    let history = useHistory()
    
    function handleClickHome() {
        history.push("/");
      }

    return(
        <div 
    onClick={handleClickHome}
    className="title"
        style={{
            display: "flex",
            flexDirection: "row",
            marginTop: "3vh",
            marginBottom: 0,
            padding: 0,
            alignItems: "end",
            justifyContent: "space-around",
            width: "80%",
            backgroundColor: "rgba(0,0,0,0.8)",
            borderRadius: "10px",
            border: "darkgreen solid 2px",
            boxShadow: "0 0 20px darkgreen"
}}
    >
        <div
            style={wordstyle}
        >
            <p
                style={capstyle}
            >F</p>
            <p
                style={lowstyle}
                id="title1"
            >ree</p>
        </div>
        <div
            style={wordstyle}
        >
            <p
                style={capstyle}
            >O</p>
            <p
                style={lowstyle}
                id="title2"
            >pen</p>
        </div>
        <div
            style={wordstyle}
        >
            <p
                style={capstyle}
            >S</p>
            <p
                style={lowstyle}
                id="title3"
            >ource</p>
        </div>
        <div
            style={wordstyle}
        >
            <p
                style={capstyle}
            >S</p>
            <p
                style={lowstyle}
                id="title4"
            >ecured</p>
        </div>
        <div
            style={wordstyle}
        >
            <p
                style={capstyle}
            >C</p>
            <p
                style={lowstyle}
                id="title5"
            >hat</p>
        </div>
        <div
            style={wordstyle}
        >
            <p
                style={capstyle}
            >A</p>
            <p
                style={lowstyle}
                id="title6"
            >pp</p>
        </div>
    </div >
    )
}
    

export default Title;