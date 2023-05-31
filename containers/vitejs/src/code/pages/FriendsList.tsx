import React, { useEffect } from "react"
import axios from 'axios'
import { useState, useRef } from "react";

import * as utils from "../utils/utils"

import Cell from "../components/Cell";
import Frame from "../components/Frame";
import { ChanButton, ChanButtonB, AllMessagesContainer, SmallButton, ButtonsChannelFriends, Add } from '../components/template'
import { useNavigate } from "react-router";

let navigate:any;

function Friends () {

	const AddFriend = "/addfriend";

	navigate = useNavigate();
	let userSend = utils.getCurrentUser();
	interface ItemFriends {id : number, login : string, displayname : string, picture : string, state : number}
	const [friends, setFriends] = useState<ItemFriends[]>([]);
	useEffect(() => {

	axios.get(`${import.meta.env.VITE_BACK_URL}/user/me/friends`, { withCredentials: true })
		.then(res => {
			setFriends(res.data);
		})
	}, [])

	let a : JSX.Element[] = [];
	let i : number = 0;
	interface idFriends {id : number, displayname : string, login : string}
	let varFriend : idFriends = {id : -1, displayname : '', login : ''};
	if (friends.length == 1) {if (friends[0].displayname === null) i = 1;}
	for (; i < friends.length; i++) {
		if (friends[i].id !== null) {
			varFriend.id = friends[i].id;
			varFriend.displayname = friends[i].displayname;
			varFriend.login = friends[i].login;
		if (i % 2 == 0) a.push(<ChanButton href="/userpage" data={friends[i].login} idFriend={varFriend} bool={false} title={friends[i].displayname} color="bggrey8" key={i}/>)
			else 			a.push(<ChanButton href="/userpage" data={friends[i].login} idFriend={varFriend} bool={false} title={friends[i].displayname} color="bggrey9" key={i}/>)
		}
	}
	a.push(<Add href={AddFriend} title="Add Friends" key={i} friend={false}/>)

	return (
		<Frame title="friends list">
			<div className="flex col h100 w100 relative">
				<AllMessagesContainer>
					<div className="flex col h90 w100">{a}</div>
				</AllMessagesContainer>
				<ButtonsChannelFriends/>
			</div>
		</Frame>
	)
}

export {Friends}
