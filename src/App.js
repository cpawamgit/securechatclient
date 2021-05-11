import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
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
import Home from "./components/home";
import Create from "./components/create";
import Join from "./components/join";
import Room from "./components/room";
import colorList from './components/colors'

/////////////   SRV CONFIG    /////////////////////
const localMode = true

const localSRV = "http://localhost:3002";
const liveSRV = "https://server2.cyrilmorin.fr:3002";
const srv = localMode ? localSRV : liveSRV;

if (!localMode) {
  if (window.location.protocol !== "https:") {
    window.location.protocol = "https:";
  }
}


const socket = io(srv);


function App() {
  const [actualSocket, setActualSocket] = useState(null)
  const [roomName, setRoomName] = useState('');
  const [nickName, setNickName] = useState('');
  const [password, setPassword] = useState('');
  const [pubKey, setPubKey] = useState('')
  const [privKey, setPrivKey] = useState('')
  const [exportedPublicKey, setExportedPublicKey] = useState('')
  const [displayMessage, setDisplayMessage] = useState(true)
  const [userList, setUserList] = useState([]);
  const [colors, setColors] = useState(colorList)
  const [userColors, setUserColors] = useState([])
  const [isAdmin, setIsAdmin] = useState(false);

  function displayTimer() {
    setTimeout(() => {
      setDisplayMessage(false)
    }, 5000);
  }

  async function importKey(key) {
    const importedKey = await window.crypto.subtle.importKey(
        "jwk",
        key,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["encrypt"]
    )
    return importedKey;
}

async function importUsers(userlst) {
    const lst = await Promise.all(userlst.map(async (item) => {
        const key = await importKey(item.pubKey);
        item.pubKey = key;
        return item;
    }))
    return lst
}

function pickColor() {
  let num = Math.floor(Math.random() * colors.length)
  let colorArray = colors;
  let color = colorArray.splice(num, 1)
  setColors(colorArray);
  return color[0];
}

useEffect(() => {
  let coloredUser;
  let tmp = [...userColors];
  userList.forEach((user) => {
      coloredUser = userColors.find((item) => {
          return item.nickName === user.nickName
      })
      if (!coloredUser){
          if (user.nickName === nickName){
              coloredUser = {
                  nickName: user.nickName,
                  color: "white"
              }
          } else {
              coloredUser = {
                  nickName: user.nickName,
                  color: pickColor()
              }
          }                
          tmp.push(coloredUser)
      }            
  })
  let colorArray = [...colors]
  tmp = tmp.reduce((acc, item) => {
      let user = userList.find((usr) => {
          return usr.nickName === item.nickName
      })
      if (user){
          acc.push(item)
      } else {
          colorArray.push(item.color)
      }
      return acc
  }, [])
  setUserColors(tmp)
  setColors(colorArray)
}, [userList])

  useEffect(() => {
    socket.on("connect", () => {
      setActualSocket(socket);
    });
    socket.on('error', (msg) => {
      alert(msg)
    })
    socket.on('update user list', async (userlst) => {
      const listWithImportedKey = await importUsers(userlst)
      setUserList(listWithImportedKey)
      console.log('update user list called')
  })
    if (pubKey === '') {
      window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
      ).then((res) => {
        setPrivKey(res.privateKey);
        setPubKey(res.publicKey);
        displayTimer();
        window.crypto.subtle.exportKey(
          "jwk",
          res.publicKey
        ).then((res) => {
          setExportedPublicKey(res);
        })
      })
    }
  }, [])
  return (
    !actualSocket ?
      <h1 style={{ color: 'darkgreen' }}>Connecting to the server...</h1>
      :
      <div className="App">
        {displayMessage ? privKey ? <h1>Keys generated</h1> : <h1>Generating keys</h1> : null}
        <Router>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/create">
              <Create socket={actualSocket}
                exportedPublicKey={exportedPublicKey}
                roomName={roomName}
                setRoomName={setRoomName}
                nickName={nickName}
                setNickName={setNickName}
                password={password}
                setPassword={setPassword}
                setIsAdmin={setIsAdmin}
              />
            </Route>
            <Route exact path="/join">
              <Join roomName={roomName}
                setRoomName={setRoomName}
                socket={actualSocket} 
                nickName={nickName}
                setNickName={setNickName}
                exportedPublicKey={exportedPublicKey}
                setIsAdmin={setIsAdmin}
                password={password}
                setPassword={setPassword}
                />
            </Route>
            <Route exact path="/room">
              <Room socket={actualSocket}
                roomName={roomName}
                nickName={nickName}
                pubKey={pubKey}
                privKey={privKey}
                exportedPublicKey={exportedPublicKey}
                userList={userList}
                userColors={userColors}
                isAdmin={isAdmin}
              />
            </Route>
          </Switch>
        </Router>
      </div>
  );
}

export default App;
