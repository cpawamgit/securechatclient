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
import { v4 as uuidv4 } from 'uuid';

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
    const [userList, setUserList] = useState([]);

    function updateMsgList(msg) {
        setMessagesList((prev) => {
            const tmp = [...prev]
            tmp.push({sender: msg.sender, msg: msg.msg})
            return ([...tmp])
        })

    }

    function sendMessageIfEnter(e) {
        if (e.key === "Enter"){
            sendMessage()
        } else {
            return
        }
    }

    function sendMessage() {
        params.socket.emit('chat message sent', 
        {msg: typing, sender: nickName, roomName: params.roomName})
        setMessagesList((prev) => {
            const tmp = [...prev]
            tmp.push({sender: "You", msg: typing})
            return ([...tmp])
        })
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
        {roomName: params.roomName, password: roomPassword, nickName: nickName})
    }

    useEffect(() => {
        if (!isReady) {
            let nick = nickName;
            if (params.adminNick !== ''){
                setNickName(params.adminNick)
                nick = params.adminNick;
            }
            params.socket.emit('enter room', 
            {id :params.socket.id, roomName: params.roomName, nickName: nick})
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
        params.socket.on('update user list', (userlst) => {
            setUserList(userlst)
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
            <div key={uuidv4()} className="message">
                <p>{item.sender} : </p>
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
                    onChange={handleChangeTyping} onKeyDown={sendMessageIfEnter}></input>
                    <button onClick={sendMessage}>Enter</button>
    </div>

    const msgDisplayer = <div className="msg-displayer">
        <div className="messages">
            <ul>
                {messages}
            </ul>
        </div>
    </div>

    const users = userList.map((item) => {
       return (<div key={uuidv4()} className="users">
            <p>{item.nickName}</p>
            <p>{item.owner ? "admin" : "user"}</p>
        </div>)
    })

    return isReady ? isAdmin ? (
        <div className="room-wrapper">
            {errMsg && <h1>{errMsg}</h1>}
            <h1>Room name : {params.roomName}</h1>
            {msgDisplayer}
            {typeAndSend}
            {users}
        </div>
    )
        :
        (
            <div className="room-wrapper">
                {errMsg && <h1>{errMsg}</h1>}
                <h1>Room name : {params.roomName}</h1>
                {authDiv}
                {userAuthenticated && msgDisplayer}
                {userAuthenticated && typeAndSend}
                {userAuthenticated && users}
            </div>
        )
        :
        <h1>Waiting server response...</h1>
}

export default Room;