import React from "react";
import {
    Redirect,
} from "react-router-dom";
import { useState, useEffect } from "react";

function Join(params) {
    const [roomList, setRoomList] = useState(null)
    const [roomAccess, setRoomAccess] = useState(null)
    const [redirect, setRedirect] = useState(false)
    const [waitingApproval, setWaitingApproval] = useState(false)
    const [accessDenied, setAccessDenied] = useState(false)
    const [search, setSearch] = useState('')
    const [awaitingInfo, setAwaitingInfo] = useState(false)


    function handleJoin(roomName, roomAccess) {
        setRoomAccess(roomAccess)
        params.setRoomName(roomName)
        setAwaitingInfo(true)
    }

    function handleChangeNick(e) {
        params.setNickName(e.target.value);
    }

    function handleChangePass(e) {
        params.setPassword(e.target.value);
    }

    function handleChangeSearch(e) {
        setSearch(e.target.value)
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
        if (item.roomName.includes(search)) {
            return (
                <button key={item.roomName}
                    className="styled-button"
                    style={{
                        width: "100%",
                        fontSize: "calc(0.75vh + 0.75vw)",
                        marginBottom: "1vh"
                    }}
                    onClick={() => handleJoin(item.roomName, item.roomAccess)}>
                    <p className="room-name-query">Roomname : {item.roomName}</p>
                    <p className="access-name-query">Access : {item.roomAccess}</p>
                </button>
            )
        } else {
            return null
        }

    })
        :
        <p>loading...</p>

    const nickNameField = <div>
        <label htmlFor="nickName">Enter your nickname :</label>
        <input type="text"
            id="nickName"
            name="nickName"
            value={params.nickName}
            onChange={handleChangeNick}
            required
        ></input>
    </div>

    let searchField = <div
        style={{
            position: "relative",
            width: "90%",
            height: "10%",
            marginTop: "3vh",
            marginBottom: "2vh",
        }}
    >
        <p
            style={{
                color: "lightgreen",
                fontSize: "calc(1vh + 1vw)"
            }}
        >Search for a room by name :</p>
        <input
            style={{
                position: "relative",
                marginTop: "1vh"
            }}
            type="text"
            id="search"
            name="search"
            value={search}
            onChange={handleChangeSearch}
        ></input>
    </div>

    return roomList ? (
        <div className="join-wrapper"
            style={{
                position: "relative",
                width: "80%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.8)",
                marginTop: "4vh",
                marginBottom: "4vh",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 0 20px darkgreen",
                border: "darkgreen solid 2px"
            }}
        >
            {redirect && <Redirect to="/room" />}
            {searchField}
            {awaitingInfo && <div
                style={{
                    width: "90%",
                    height: "60%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-around",
                    marginTop: "10%"
                }}
            >
                {roomAccess === 'free' &&
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "space-around",
                            height: "100%",
                            width: "100%",
                        }}
                    >
                        {nickNameField}
                        <div
                            className="back-enter"
                        >
                            <button
                                className="styled-button"
                                onClick={() => params.socket.emit('enter room free',
                                    {
                                        roomName: params.roomName,
                                        nickName: params.nickName,
                                        id: params.socket.id,
                                        pubKey: params.exportedPublicKey
                                    })}>
                                Enter Room
                        </button>
                            <button
                                className="styled-button"
                                onClick={() => setAwaitingInfo(false)}
                            >Back to list</button>
                        </div>
                    </div>
                }
                {roomAccess === 'password' &&
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "space-around",
                            height: "100%",
                            width: "100%",
                        }}
                    >
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
                        <div
                            className="back-enter"
                        >
                            <button
                                className="styled-button"
                                onClick={() => params.socket.emit('enter room password',
                                    {
                                        roomName: params.roomName,
                                        nickName: params.nickName,
                                        id: params.socket.id,
                                        pubKey: params.exportedPublicKey,
                                        password: params.password
                                    })}>
                                Enter Room
                        </button>
                            <button
                                className="styled-button"
                                onClick={() => setAwaitingInfo(false)}
                            >Back to list</button>
                        </div>
                    </div>
                }
                {roomAccess === 'request' &&
                    <div
                        style={{
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "space-around",
                        }}
                    >
                        {nickNameField}
                        <div
                            className="back-enter"
                        >
                            <button
                                className="styled-button"
                                onClick={handleRequest}>
                                Enter Room
                    </button>
                            <button
                                className="styled-button"
                                onClick={() => setAwaitingInfo(false)}
                            >Back to list</button>
                        </div>
                        {waitingApproval && <p style={{ color: "darkgreen" }}>
                            Waiting for room admin to approve
                        </p>}
                        {accessDenied !== null && <p style={{ color: "darkred" }}>
                            {accessDenied}
                        </p>}
                    </div>
                }
            </div>}
            {!awaitingInfo && <div
                style={{
                    width: "90%",
                    height: "80%",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {rooms}
            </div>}
        </div>
    )
        :
        (<h1>Loading...</h1>)
}

export default Join;
