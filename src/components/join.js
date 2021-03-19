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
    const [roomList, setRoomList] = useState([])
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        fetch('http://localhost:3002/getrooms', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then((res) => {
                return res.json()
            })
            .then((res) => {
                setRoomList(res)
                setIsReady(true)
            })
    }, [])
    const rooms = roomList.map((item) => {
        return (
            <Link key={item.roomName} to="/room"><button onClick={() => params.setRoomName(item.roomName)}>
                <p className="room-name-query">Roomname : {item.roomName}</p>
                <p className="access-name-query">Access : {item.roomAccess}</p>
            </button></Link>
        )
    })
    return isReady ? (
        <div className="join-wrapper">
            <h1>{rooms}</h1>
        </div>
    )
    :
    (<h1>Loading...</h1>)
}

export default Join;