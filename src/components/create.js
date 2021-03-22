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
import { useState } from "react";

function Create(params) {
    const [nickName, setNickName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [password, setPassword] = useState('');
    const [creationError, setCreationError] = useState(false); 
    const [creationMsg, setCreationMsg] = useState('');
    const [roomCreated, setRoomCreated] = useState(false)

    function handleChangeNick(e) {
        setNickName(e.target.value);
    }
    function handleChangeRoom(e) {
        setRoomName(e.target.value);
    }
    function handleChangePass(e) {
        setPassword(e.target.value);
    }

    function handleSubmit(e) {
        let access;
        if (password !== ''){
            access = 'password'
        } else {
            access = 'request'
        }
        fetch('https://server2.cyrilmorin.fr:3002/createroom', {
            method: 'POST',
            
            body: JSON.stringify({
                roomName: roomName,
                roomUsers: [{
                    nickName: nickName,
                    id: params.id,
                    owner: true
                }],
                roomAccess: access,
                roomPassword: password,
                roomOwner: params.id
            }),
            headers: {
                'Content-Type': 'application/json'
              },
	    mode: 'cors'
        })
            .then((res) => {
                if (!res.ok){
                    setCreationError(true)
                    setRoomCreated(false)
                } else {
                    setRoomCreated(true)
                    setCreationError(false)
                }
                return res.json();
            })
            .then((res) => {
                setCreationMsg(res.msg)
            })
        e.preventDefault();
    }


    return (
        <div className="create-wrapper">
            {!roomCreated && <form onSubmit={handleSubmit}>
                <label htmlFor="nickName">Enter your nickname here :</label>
                <input type="text"
                    id="nickName"
                    name="nickName"
                    value={nickName}
                    onChange={handleChangeNick}></input>
                    
                <label htmlFor="roomName">Enter your room name here :</label>
                <input type="text"
                    id="roomName"
                    name="roomName"
                    value={roomName}
                    onChange={handleChangeRoom}></input>
                    
                <label htmlFor="password">Room password (leave blank if not needed)</label>
                <input type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={handleChangePass}></input>                    
                <input type="hidden" value={params.id} name="id"></input>
                <button type="submit">Create Room !</button>
            </form>}
            {creationError && <h1>{creationMsg}</h1>}
            {roomCreated &&
                <div>
                    <h1>{creationMsg}</h1>
                    <Link to='/room'><button onClick={() => params.setRoomandNick(roomName, nickName)}>Enter the room!</button></Link>
                </div>
            }
        </div>
        
    );
}

export default Create;
