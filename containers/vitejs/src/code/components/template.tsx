import React, {PropsWithChildren} from "react"
import Cell  from "../components/Cell"
// import ReactModal from 'react-modal';
import { useState } from "react";

import {motion} from 'framer-motion'
import {useNavigate } from "react-router-dom";

import {GrAdd} 		  from 'react-icons/gr'
import { IconContext } from "react-icons";

type button = PropsWithChildren<{
	right?: string,
	objRight?: object,
	left?: string,
	objLeft?: object
}>;

interface idFriends {id : number, displayname : string, login : string}

type link = {
	title: string,
	color: string,
	bool:boolean,
	data?: any,
	href?: string,
	idFriend?:idFriends
}

type animButton = PropsWithChildren<{
	href?:string,
	data?:any,
	bool?:boolean,
	friend?:boolean,
	idFriend?:idFriends
}>


let navigate:any;

const Anim 		= (p:animButton) => {
	let style = {cursor:'pointer', width:'', minHeight:''}
	if (!p.data.bool) {style.width='49%'; style.minHeight='80%';}
	let href : string = '';
	if (p.href) {href = p.href;}
	if (p.idFriend) {href = `${p.href}/${p.idFriend.login}`;}
	return (
		(p.friend) ?
		<motion.div className="center" style={style} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}
		onClick={() => navigate(href)}>{p.children}</motion.div> :
		<motion.div className="center" style={style} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}
		onClick={() => navigate(p.href)} >{p.children}</motion.div>
	)
}

const ChanButton  = (p:link) => {
	if (!p.bool) {
		let obj = {
			data : p.data,
			bool : true
		}
		return (
			<Anim href={p.href} idFriend={p.idFriend} data={obj} friend={true}>
				<Cell margin="0 0 10px 0" minHeight="50px" width="100%" color={p.color}>
					{p.title}
				</Cell>
			</Anim>
		)
	}
	return (
		<Anim href='/channelchat' data={p.data} bool={p.data.bool}>
			<Cell margin="0 0 10px 0" minHeight="50px" width="100%" color={p.color}>
				<div className="">
					{p.title}&nbsp;
					{/* {p.data.id}&nbsp; */}
					{/* {p.data.type}&nbsp; */}
					{/* {p.data.password} */}
				</div>
			</Cell>
		</Anim>
	)
}

const ChanButtonB  = () => <Cell margin="0 0 10px 0" minHeight="50px" width="100%" color="bggrey8">CHANNEL NAME </Cell>
const AllMessagesContainer = ({children}:any) => <div id="messages" className="flex col w100 hideScrollBar absolute" style={{ height:"90%", maxHeight:"89%",overflowX:"auto"}}>{children}</div>
const SmallButton = (p:link) => {
	return (
		<Cell color={p.color} width="100%" height="100%" cursor="pointer">{p.title}</Cell>
	)
}

type addItem = {
	title	: string,
	key		: number,
	href?	: string,
	friend? : boolean,


}

function Add (p:addItem) {
	return (
		<div className="w100">
			<Cell opacity={0.3} margin="0 0 10px 0" minHeight="50px" width="100%" color="bggrey9">
				<div className="flex w100">
				<div className="w30"></div>
					<div className="w100 center" style={{minWidth:'10%', cursor:"pointer"}}>
						<IconContext.Provider value={{size:'2.8em', className:'center'}}>
							<Anim href={p.href} data={{bool:false}} friend={p.friend}>
								<GrAdd/>
							</Anim>
						</IconContext.Provider>
					</div>
					<div className="w100 center" style={{minWidth:'50%'}}>
						{p.title}
					</div>
					<div className="w30"></div>
				</div>
			</Cell>

		</div>
	)
}

function ButtonsChannelFriends(p:button)
{
	navigate  = useNavigate()             // This has to be used here else error

	return (
		<div className="flex w100 jcsb bottom absolute" style={{minHeight:"10%"}}>
			<Anim data={{bool : false}} href="/landing" ><SmallButton bool={false} title="channel" color="bggrey8" /></Anim>
			<Anim data={{bool : false}} href="/friendslist"><SmallButton bool={false} title="friends" color="bggrey9"/></Anim>
		</div>
	)
}

export { Anim, ChanButton, ChanButtonB, AllMessagesContainer, SmallButton, ButtonsChannelFriends, Add }
