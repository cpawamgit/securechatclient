import React from "react";
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
import { useState, useEffect } from "react";

function Join(params) {
    const [roomList, setRoomList] = useState(null)
    const [roomAccess, setRoomAccess] = useState(null)
    const [redirect, setRedirect] = useState(false)
    const [waitingApproval, setWaitingApproval] = useState(false)
    const [accessDenied, setAccessDenied] = useState(false)


    function handleJoin(roomName, roomAccess) {
        setRoomAccess(roomAccess)
        params.setRoomName(roomName)
    }

    function handleChangeNick(e) {
        params.setNickName(e.target.value);
    }

    function handleChangePass(e) {
        params.setPassword(e.target.value);
    }

    function handleRequest() {
        params.socket.emit('enter room request',
            {
                roomName: params.roomName,
                nickName: params.nickName,
                id: params.socket.id,
                pubKey: params.exportedPublicKey
            })
        setWaitingApproval(true)
    }

    useEffect(() => {
        params.socket.emit('get room list')
        params.socket.on('set room list', rooms => {
            setRoomList(rooms)
        })
        params.socket.on('room joined', () => {
            params.setIsAdmin(false)
            setRedirect(true)
        })
        params.socket.on('access denied', msg => {
            setWaitingApproval(false)
            setAccessDenied(msg)
            setTimeout(() => {
                setAccessDenied(null)
            }, 5000);
        })
    }, [])
    const rooms = roomList ? roomList.map((item) => {
        return (
            <button key={item.roomName}
                onClick={() => handleJoin(item.roomName, item.roomAccess)}>
                <p className="room-name-query">Roomname : {item.roomName}</p>
                <p className="access-name-query">Access : {item.roomAccess}</p>
            </button>
        )
    })
        :
        <p>loading...</p>

    const nickNameField = <div>
        <label htmlFor="nickName">Enter your nickname here :</label>
        <input type="text"
            id="nickName"
            name="nickName"
            value={params.nickName}
            onChange={handleChangeNick}
            required
        ></input>
    </div>

    return roomList ? (
        <div className="join-wrapper">
            {redirect && <Redirect to="/room" />}
            <h1>{rooms}</h1>
            {roomAccess === 'free' &&
                <div>
                    {nickNameField}
                    <button onClick={() => params.socket.emit('enter room free',
                        {
                            roomName: params.roomName,
                            nickName: params.nickName,
                            id: params.socket.id,
                            pubKey: params.exportedPublicKey
                        })}>
                        Enter Room
                        </button>
                </div>
            }
            {roomAccess === 'password' &&
                <div>
                    {nickNameField}
                    <div>
                        <label htmlFor="password">Enter the room password :</label>
                        <input type="text"
                            id="password"
                            name="password"
                            value={params.password}
                            onChange={handleChangePass}
                            required
                        ></input>
                    </div>
                    <button onClick={() => params.socket.emit('enter room password',
                        {
                            roomName: params.roomName,
                            nickName: params.nickName,
                            id: params.socket.id,
                            pubKey: params.exportedPublicKey,
                            password: params.password
                        })}>
                        Enter Room
                        </button>
                </div>
            }
            {roomAccess === 'request' &&
                <div>
                    {nickNameField}
                    <button onClick={handleRequest}>
                        Enter Room
                    </button>
                    {waitingApproval && <p style={{ color: "darkgreen" }}>
                        Waiting for room admin to approve
                        </p>}
                    {accessDenied !== null && <p style={{ color: "darkred" }}>
                        {accessDenied}
                    </p>}
                </div>
            }
        </div>
    )
        :
        (<h1>Loading...</h1>)
}

export default Join;
