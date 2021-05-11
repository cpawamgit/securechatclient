import React, { useEffect } from "react";
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
import { useState } from "react";

function Create(params) {
    const [access, setAccess] = useState('request')
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

    let selected = { backgroundColor: "lightgreen" }
    return (
        <div className="create-wrapper">
            <div className="room-access-select">
                <div className="button-group">
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
                className="creation-form"
                onSubmit={handleSubmit}>
                <label htmlFor="nickName">Enter your nickname here :</label>
                <input type="text"
                    id="nickName"
                    name="nickName"
                    value={params.nickName}
                    onChange={handleChangeNick}
                    required
                    ></input>

                <label htmlFor="roomName">Enter your room name here :</label>
                <input type="text"
                    id="roomName"
                    name="roomName"
                    value={params.roomName}
                    onChange={handleChangeRoom}
                    required
                    ></input>
                {access === "password" && <div 
                style={{display: "flex", flexDirection: "column"}}>
                <label htmlFor="password">Room password</label>
                <input type="password"
                    id="password"
                    name="password"
                    value={params.password}
                    onChange={handleChangePass}
                    required
                    ></input>
                    </div>}
                <input type="hidden" value={params.id} name="id"></input>
                <button type="submit">Create Room !</button>
            </form>
            {redirect && <Redirect to="/room" />}
        </div>

    );
}

export default Create;
