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

function Room(params) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [srvmsg, setsrvmsg] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [userAuthenticated, setUserAuthenticated] = useState(false);
    const [userCheck, setUserCheck] = useState('');
    const [roomPassword, setRoomPassword] = useState('');
    const [passwordResponse, setPasswordResponse] = useState('');
    const [messagesList, setMessagesList] = useState([]);
    const [nickName, setNickName] = useState('');
    const [typing, setTyping] = useState('');

    function updateMsgList(msg) {
        setMessagesList((prev) => {
            const tmp = [...prev]
            tmp.push({sender: msg.sender, msg: msg.msg})
            return ([...tmp])
        })

    }

    function sendMessage() {
        params.socket.emit('chat message sent', 
        {msg: typing, sender: nickName, roomName: params.roomName})
        setTyping('');
    }

    function handleChangeTyping(e) {
        setTyping(e.target.value)
    }
    
    function handleChangePassword(e) {
        setRoomPassword(e.target.value);
    }

    function handleChangeNickname(e) {
        setNickName(e.target.value);
    }

    function sendPassword() {
        params.socket.emit('check password', 
        {roomName: params.roomName, password: roomPassword})
    }

    useEffect(() => {
        if (!isReady) {
            params.socket.emit('enter room', 
            {id :params.socket.id, roomName: params.roomName})
            setIsReady(true);
        }
        params.socket.on('errMsg', (msg) => {
            setErrMsg(msg);
        })
        params.socket.on('room entered admin', (msg) => {
            setsrvmsg(msg.srvMsg);
            setIsAdmin(true);
            setNickName(params.adminNick);
        })
        params.socket.on('room entered', (msg) => {
            setsrvmsg(msg)
        })
        params.socket.on('user check', (msg) => {
            setUserCheck(msg)
        })
        params.socket.on('password response', (msg) => {
            setPasswordResponse(msg);
            if (msg === 'true'){
                setUserAuthenticated(true)
            }
        })
        params.socket.on('chat message received', (msg) => {
            updateMsgList(msg)
        })
    }, [])

    let authDiv;
    if (!userAuthenticated){
        if (userCheck === 'password'){
            authDiv = (
                <div className="authDiv">
                    <p>Please enter the room password : </p>
                    <input type="password"
                    id="password"
                    name="password"
                    value={roomPassword}
                    onChange={handleChangePassword}></input>
                    <p>Choose a nickname : </p>
                    <input type="text"
                    id="nickName"
                    name="nickName"
                    value={nickName}
                    onChange={handleChangeNickname}></input>
                    <button onClick={sendPassword}>Enter</button>
                    <h1>Password response : {passwordResponse}</h1>
                </div>
            )
        } else if (userCheck === 'request'){

        } else {

        }
    } else {
        authDiv = null;
    }
    const messages = messagesList.map((item) => {
        return(
            <div className="message">
                <p>{item.sender}</p>
                <p>{item.msg}</p>
            </div>
        )
    })

    const typeAndSend = <div>
        <p>your message : </p>
                    <input type="text"
                    id="typing"
                    name="typing"
                    value={typing}
                    onChange={handleChangeTyping}></input>
                    <button onClick={sendMessage}>Enter</button>
    </div>

    const msgDisplayer = <div className="msg-displayer">
        <div className="messages">
            <ul>
                {messages}
            </ul>
        </div>
    </div>

    return isReady ? isAdmin ? (
        <div className="room-wrapper">
            {errMsg && <h1>{errMsg}</h1>}
            {msgDisplayer}
            {typeAndSend}
        </div>
    )
        :
        (
            <div className="room-wrapper">
                {errMsg && <h1>{errMsg}</h1>}
                {authDiv}
                {msgDisplayer}
                {typeAndSend}
            </div>
        )
        :
        <h1>Waiting server response...</h1>
}

export default Room;