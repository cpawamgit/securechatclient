import React, { useEffect } from "react";
import {
    Redirect,
} from "react-router-dom";
import { useState } from "react";

function Create(params) {
    const [access, setAccess] = useState('password')
    const [redirect, setRedirect] = useState(false)

    function handleChangeNick(e) {
        params.setNickName(e.target.value);
    }
    function handleChangeRoom(e) {
        params.setRoomName(e.target.value);
    }
    function handleChangePass(e) {
        params.setPassword(e.target.value);
    }

    function handleSubmit(e) {
        params.socket.emit('room creation', {
            roomName: params.roomName,
            roomUsers: [{
                nickName: params.nickName,
                id: params.socket.id,
                pubKey: params.exportedPublicKey
            }],
            roomAccess: access,
            roomPassword: params.password,
            roomOwner: params.socket.id,
            blockedUsers: []
        })
        e.preventDefault();
    }

    useEffect(() => {
        params.socket.on('room created', () => {
            params.setIsAdmin(true)
            setRedirect(true)
        })
    }, [])

    let selected = { backgroundColor: "darkgreen" }
    const width = params.ratio.width > 600 ? "80%" : "100%"

    return (
        <div className="create-wrapper"
        style={{
            width: width
        }}
        >
            <div id="room-access-select"
                style={{
                    width: "100%"
                }}
            >
                <div className="button-group"
                    // style={{
                    //     width: "100%",
                    //     height: "10vh",
                    //     marginTop: "3vh",
                    //     display: "flex",
                    //     flexDirection: "row",
                    //     alignItems: "center",
                    //     justifyContent: "space-around",
                    // }}
                >
                    <button
                        onClick={() => setAccess('password')}
                        style={access === "password" ? selected : null}
                    >Password
                </button>
                    <button
                        onClick={() => setAccess('request')}
                        style={access === "request" ? selected : null}
                    >Request
                </button>
                    <button
                        onClick={() => setAccess('free')}
                        style={access === "free" ? selected : null}
                    >Free Access
                 </button>
                </div>
            </div>
            <form
                id="room-creation-form"
                // style={{
                //     width: "80%",
                //     height: "70%",
                //     marginTop: "5%",
                //     display: "flex",
                //     flexDirection: "column",
                //     alignItems: "center",
                //     justifyContent: "space-around"
                // }}
                className="creation-form"
                onSubmit={handleSubmit}>
                <label htmlFor="nickName">Enter your nickname :</label>
                <input type="text"
                    id="nickName"
                    name="nickName"
                    value={params.nickName}
                    onChange={handleChangeNick}
                    required
                ></input>

                <label htmlFor="roomName">Enter your room name :</label>
                <input type="text"
                    id="roomName"
                    name="roomName"
                    value={params.roomName}
                    onChange={handleChangeRoom}
                    required
                ></input>
                {access === "password" &&
                    <label htmlFor="password">Enter the room password :</label>}
                {access === "password" && <input type="password"
                    id="password"
                    name="password"
                    value={params.password}
                    onChange={handleChangePass}
                    required
                ></input>}

                <input type="hidden" value={params.id} name="id"></input>
                <button
                    id="create-room-btn"
                    // style={{
                    //     borderRadius: "10px",
                    //     boxShadow: "0 0 20px darkgreen",
                    //     border: "darkgreen solid 2px",
                    //     backgroundColor: "transparent",
                    //     color: "lightgreen",
                    //     fontSize: "calc(1vh + 1vw)"
                    // }}
                    type="submit">Create Room !</button>
            </form>
            {redirect && <Redirect to="/room" />}
        </div>

    );
}

export default Create;
