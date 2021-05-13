import React, { useCallback } from "react";
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
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

function Room(params) {
    const [messagesList, setMessagesList] = useState([]);
    const [typing, setTyping] = useState('');
    const [requestList, setRequestList] = useState([])
    const [pendingRequest, setPendingRequest] = useState(null)
    const [messageOptions, setMessageOptions] = useState({
        activated: false,
        id: null
    })

    function sendMessageIfEnter(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            sendMessage()
            e.preventDefault()
        } else {
            return
        }
    }

    function handleQuote(msg) {
        setTyping(
            `${msg.sender} said :\n"${msg.msg}"\n\n`
        )
        let typing = document.getElementById('typing')
        typing.focus()
    }

    function handleMessageOptions(id) {
        if (messageOptions.activated && id === messageOptions.id) {
            setMessageOptions({
                activated: false,
                id: null
            })
        } else {
            setMessageOptions({
                activated: true,
                id: id
            })
        }
    }

    async function encryptMsgs() {
        const lst = params.userList.reduce((acc, item) => {
            if (item.nickName !== params.nickName) {
                const tmp = {
                    user: item.nickName,
                    key: item.pubKey
                }
                acc.push(tmp)
            }
            return acc;
        }, [])
        const msgs = await Promise.all(lst.map(async (item) => {
            let encoder = new TextEncoder()
            let encodedMsg = encoder.encode(typing)
            const encrypedMsg = await window.crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP"
                },
                item.key,
                encodedMsg
            )
            return {
                user: item.user,
                msg: encrypedMsg
            }
        }))
        return msgs;
    }

    async function sendMessage() {
        const encryptedMsgs = await encryptMsgs()
        params.socket.emit('chat message sent',
            { msg: encryptedMsgs, sender: params.nickName, roomName: params.roomName })
        setMessagesList((prev) => {
            const tmp = [...prev]
            let id = uuidv4()
            tmp.push({ sender: "You", msg: typing, id: id })
            return ([...tmp])
        })
        setTyping('');
    }

    function handleChangeTyping(e) {
        setTyping(e.target.value)
    }

    function handlePendingRequest(user, decision) {
        setRequestList(requestList => {
            let tmp = requestList.filter(item => item.id !== user.id)
            return tmp
        })
        setPendingRequest({ user: user, decision: decision })
    }

    function handleConfirm(confirms) {
        if (confirms) {
            if (pendingRequest.decision === 'accept') {
                params.socket.emit('request accepted', pendingRequest.user)
            } else {
                params.socket.emit('request denied', pendingRequest.user)
            }
        } else {
            setRequestList(requestList => {
                let tmp = [...requestList]
                tmp.push(pendingRequest.user)
                return tmp
            })
        }
        setPendingRequest(null)
    }

    function buildList() {
        if (params.userList && Array.isArray(params.userList)) {
            return params.userList.map((item) => {
                return (<div key={uuidv4()} className="users">
                    <p>{item.nickName}</p>
                    <p>{item.owner ? "admin" : "user"}</p>
                </div>)
            })
        } else {
            return null;
        }
    }

    async function decypher(msg) {
        const decyphered = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            params.privKey,
            msg.msg
        )
        let decoder = new TextDecoder();
        let decoded = decoder.decode(decyphered)
        return {
            sender: msg.sender,
            msg: decoded
        };
    }

    useEffect(() => {
        function updateMsgList(msg) {
            setMessagesList((prev) => {
                let id = uuidv4()
                const tmp = [...prev]
                tmp.push({ sender: msg.sender, msg: msg.msg, id: id })
                return ([...tmp])
            })
        }
        params.socket.on('chat message received', async (msg) => {
            const clearMsg = await decypher(msg)
            updateMsgList(clearMsg)
        })
        params.socket.on('entry requested', userData => {
            setRequestList(requestList => {
                let tmp = [...requestList]
                tmp.push(userData)
                return tmp
            })
        })
    }, [])


    const messages = messagesList.map((item) => {
        let user = params.userColors.find((usr) => usr.nickName === item.sender)
        if (!user) {
            user = { color: "white" }
        }
        let generatedId = uuidv4()
        return (
            <div style={{ backgroundColor: user.color, width: "max-content" }}
                key={generatedId}
                id={generatedId}
                onClick={() => handleMessageOptions(item.id)}
                className="message">
                <p>{item.sender} : </p>
                <p style={{whiteSpace: "pre-wrap"}}>{item.msg}</p>
                {(messageOptions.activated && messageOptions.id === item.id) &&
                    <button onClick={() => handleQuote(item)} >Quote</button>
                }
            </div>
        )
    })

    const typeAndSend = <div>
        <p>your message : </p>
        <textarea 
        style={{whiteSpace: "pre-wrap"}}
            id="typing"
            name="typing"
            value={typing}
            onChange={handleChangeTyping} onKeyDown={sendMessageIfEnter}></textarea>
        <button onClick={sendMessage}>Enter</button>
    </div>

    const msgDisplayer = <div className="msg-displayer">
        <div className="messages">
            <ul>
                {messages}
            </ul>
        </div>
    </div>

    const users = buildList()
    const waitingUsers = <div>
        <h2>Users waiting for approval :</h2>
        {requestList.map((item) => {
            return (<div style={{ display: "flex", flexDirection: "row" }}>
                <button style={{ color: "darkgreen" }}
                    onClick={() => handlePendingRequest(item, 'accept')}
                >Accept</button>
                <p>{item.nickName}</p>
                <button style={{ color: "red" }}
                    onClick={() => handlePendingRequest(item, 'deny')}
                >Deny</button>
            </div>)
        })}
    </div>
    const confirmButtons = pendingRequest !== null ?
        pendingRequest.decision === 'accept' ?
            <div style={{
                position: "fixed",
                zIndex: 2,
                top: 0,
                left: 0,
                height: "100vh",
                width: "100vw",
                backgroundColor: "rgba(30, 30, 30, 0.2)"
            }}>
                <p style={{
                    backgroundColor: "white",
                    width: "20vw",
                    marginLeft: "40vw",
                    marginTop: "60vh"
                }}>Are you sur to accept {pendingRequest.user.nickName} request</p>
                <button onClick={() => handleConfirm(true)}>Yes</button>
                <button onClick={() => handleConfirm(false)}>No</button>
            </div>
            :
            <div style={{ zIndex: 2, height: "90vh", width: "90vw", backgroundColor: "lightgray" }}>
                <p>Are you sur to deny {pendingRequest.user.nickName} request</p>
                <button onClick={() => handleConfirm(true)}>Yes</button>
                <button onClick={() => handleConfirm(false)}>No</button>
            </div>
        :
        null
    let centerWidth = 90 * (params.ratio.height / params.ratio.width)
    centerWidth = centerWidth > 95 ? 95 : centerWidth
    console.log(messagesList)
    return (
        <div className="room-wrapper"
        style={{width: `${centerWidth}vw`}}
        >
            {params.isAdmin && waitingUsers}
            <h1>Room name : {params.roomName}</h1>
            <p>{centerWidth}</p>
            <div style={{
                backgroundColor: "lightgray"
            }}>
                {msgDisplayer}
                {typeAndSend}
                {users}
            </div>
            {pendingRequest !== null && confirmButtons}
        </div>
    )
}

export default Room;