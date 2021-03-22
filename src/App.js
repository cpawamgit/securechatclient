import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from 'react';
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


const socket = io("https://server2.cyrilmorin.fr:3002");


function App() {
  const [actualSocket, setActualSocket] = useState({})
  const [isLoaded, setIsLoaded] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [nickName, setNickName] = useState('');
  // const [items, setItems] = useState([]);
  // const [error, setError] = useState(null);
  function setRoomandNick(roomName, nickName) {
    setRoomName(roomName);
    setNickName(nickName);
  }

  useEffect(() => {
    socket.on("connect", () => {
      setActualSocket(socket);
      setIsLoaded(true)
    });
    // fetch("http://localhost:3002/getroom")
    // .then(res => res.json())
    // .then(
    //   (result) => {
    //     setIsLoaded(true);
    //     setItems(result[0]);
    //     console.log("fetch results : " + result[0].roomname)
    //   },
    //   // Remarque : il faut gérer les erreurs ici plutôt que dans
    //   // un bloc catch() afin que nous n’avalions pas les exceptions
    //   // dues à de véritables bugs dans les composants.
    //   (error) => {
    //     setIsLoaded(true);
    //     setError(error);
    //   }
    // )
  }, [])
  
  return (
    !isLoaded ? 
    <h1>Loading...</h1>
     :
    <div className="App">
      <Router>
            <Switch>
                <Route exact path="/">
                    <Home/>
                </Route>    
                <Route exact path="/create">
                    <Create id={actualSocket.id} setRoomandNick={setRoomandNick}/>
                </Route>
                <Route exact path="/join">
                    <Join id={actualSocket.id} setRoomName={setRoomName}/>
                </Route>
                <Route exact path="/room">
                    <Room socket={actualSocket} roomName={roomName} adminNick={nickName}/>
                </Route>             
            </Switch>
        </Router>
    </div>
  );
}

export default App;
