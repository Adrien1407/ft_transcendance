import React, { PropsWithChildren, useEffect, useState } from "react"
import Frame from "../../components/Frame"
import goBack from '../../../assets/square_chev_left.svg'
import axios from "axios"
import Cell from "../../components/Cell"
import { IconContext } from "react-icons"
import { GrAdd } from "react-icons/gr"
import {BiUserCircle} from 'react-icons/bi'
import { motion } from "framer-motion"
import {useNavigate } from "react-router-dom";
import * as utils from '../../utils/utils'

let navigate : any;

interface idFriends {id : number, displayname : string, login : string}
type animButton = PropsWithChildren<{
	href?:string,
	data:any,
	addFriend: boolean,
	onClick?:any
	idFriend?:idFriends
}>

const Anim 		= (p:animButton) => {
	let href : string = '';
	if (p.href) href = p.href;
	if (p.idFriend) {href = `${p.href}/${p.idFriend.login}`;}
	return (
		<>
			{p.addFriend ?  <motion.div className="center"whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}
			onClick={p.onClick} >{p.children}</motion.div>
			:
			<motion.div className="center"whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}
			onClick={() => navigate(href)} >{p.children}</motion.div>}
		</>
	)
}
type addItem = {
	title	: string,
	key		: number,
	href?	: string,
	data?	: any,
	color?	: string,
	friend? : boolean,
	idFriend : idFriends

}

function Add (p:addItem) {

	const onClick = () => {
		axios.post(`${import.meta.env.VITE_BACK_URL}/user/add_friend/${p.data.id}`, utils.getCookie(), {withCredentials : true})
		.then((res) => {
		setTimeout(() => navigate('/friendslist'),100)
	})
	}
	return (
		<div className="w100">
			<Cell opacity={1} margin="0 0 10px 0" minHeight="50px" width="100%" color={p.color}>
				<div className="flex w100">
				<div className="w30"></div>
				{
				(p.friend === false || p.friend === undefined) ?
					<div className="w100 center" style={{minWidth:'10%', cursor:"pointer"}}>
						<IconContext.Provider value={{size:'2.8em', className:'center'}}>
							<Anim href={p.href} data={p.data} addFriend={true} onClick={onClick}>
								<GrAdd/>
							</Anim>
						</IconContext.Provider>
					</div> : <div className="w100 center" style={{minWidth:'10%', cursor:"pointer"}}>
						<IconContext.Provider value={{size:'2.8em', className:'center'}}>
							<Anim href={p.href} idFriend={p.idFriend} data={p.data} addFriend={false}>
								<BiUserCircle/>
							</Anim>
						</IconContext.Provider>
					</div>
				}
					<div className="w100 center" style={{minWidth:'50%'}}>
						{p.title}
					</div>
					<div className="w30"></div>
				</div>
			</Cell>

		</div>
	)
}

const AllMessagesContainer = ({children}:any) => <div id="messages" className="flex col w100 hideScrollBar absolute" style={{ height:"90%", maxHeight:"89%",overflowX:"auto"}}>{children}</div>

function AddFriend() {
	navigate  = useNavigate();
	const [user, setUser] = useState<JSX.Element[]>([]);
	let myFriend : Array<string> = []
	const me = utils.getCurrentUser()
	const id = utils.getCookie().user.id;
	let color = 0;
	if (id % 2 == 0) {color = 1;}

	let varFriend : idFriends = {id : -1, displayname : '', login : ''};
	useEffect(() => {

		axios.get(`${import.meta.env.VITE_BACK_URL}/user/me/not_friends`, {withCredentials:true})
		.then(res => {
			let a : JSX.Element[] = [];
			for (let i = 0; i < res.data.length; i++) {
				if (res.data[i].login !== me) {
					varFriend.id = res.data[i].id;
					varFriend.displayname = res.data[i].displayname;
					varFriend.login = res.data[i].login;
					const applyColor = (i - color) % 2 == 0 ? "bggrey8" : "bggrey9";
					a.push(<Add data={res.data[i]} idFriend={varFriend} title={res.data[i].displayname} key={i} color={applyColor}/>)
				}
			}
			setUser(a);
		})
	}, [])

	if(user.length == 0) {
		return (
			<Frame title="No other users" titleImgLeft={goBack} hrefLeft='/friendslist' chat={true}>
			<div id="addFriend" className="flex h100 w100 bggrey9 center">
				Empty
			</div>
		</Frame>
		)
	}

	return(
		<Frame title="Search Users" titleImgLeft={goBack} hrefLeft='/friendslist' chat={true}>
			<div id="addFriend" className="flex col h100 w100 relative">
				<AllMessagesContainer>
				{user}
				</AllMessagesContainer>
			</div>
		</Frame>
	)
}

export default AddFriend
