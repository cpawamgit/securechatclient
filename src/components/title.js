import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

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


function Title(params) {

    let history = useHistory()
    let location = useLocation();

    function handleBack() {
        params.socket.emit('leave room')
        params.setPopUp(false)
        window.location.href = "/"
    }


    function handleClickHome() {
        if (location.pathname === '/room') {
            if (!params.popUp) {
                params.setPopUp(true)
            }
        } else {
            history.push("/");
        }
    }

    function killPopUp() {
        params.setPopUp(false)
    }

    const width = params.ratio.width > 600 ? "80%" : "100%"

    const popUpDiv =
        <div
            style={{
                width: "100vw",
                height: "100vh",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 5,
                backgroundColor: "rgba(0,0,0,0.8)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <p
                style={{
                    color: "lightgreen",
                    fontSize: "calc(1vh + 1vw)",
                    marginBottom: "3vh"
                }}
            >Do you really want to leave the room ?</p>
            <div
            style={{
                width: "20vw",
                display: "flex",
                justifyContent: "space-around"
            }}
            >
                <button
                    onClick={handleBack}
                    className="styled-button"
                >Yes</button>
                <button
                    onClick={killPopUp}
                    className="styled-button"
                >No</button>
            </div>
        </div>
    return (
        <div
            onClick={handleClickHome}
            className="title"
            style={{
                display: "flex",
                flexDirection: "row",
                marginBottom: 0,
                padding: 0,
                alignItems: "end",
                justifyContent: "space-around",
                width: width,
                backgroundColor: "rgba(0,0,0,0.8)",
                borderRadius: "10px",
                border: "darkgreen solid 2px",
                boxShadow: "0 0 20px darkgreen"
            }}
        >
            {params.popUp && popUpDiv}
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