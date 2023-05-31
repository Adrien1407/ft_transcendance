import React from "react";
import { SetStateAction } from "react";
import {motion, AnimatePresence} from 'framer-motion'
import * as sock from "@/utils/socket"
import { useNavigate } from "react-router";
import { useContext } from "react";
import { ChatSocket } from "@/src/main";
import { useState } from "react";

function Button (p:{
	setColor : React.Dispatch<SetStateAction<string>>,
	value:string, b?:boolean, noMargin?:boolean, fill?:boolean, onClickAction?:any, name?:string, color:string, leave?:string}) {

		const chatSocket = useContext(ChatSocket)
		const navigate   = useNavigate();
		const windowUrl  = window.location.href;
		const channel_id = Number(windowUrl.split("/")[4])

		return (
			<motion.div className={`flex center tac ${p.fill?"w100":""}`}
				initial={true}
				onClick={()=>{
					sock.changeName({
						socket     : chatSocket,
						channel_id : channel_id,
						new_name   : p.value,
						callback() {
							console.log("name changed")
							p.setColor("#A3BE8C")
						}
					})
					p.setColor("#ea6962")
				}}
				whileTap={{x:"-3px", y:"3px", boxShadow:"-1px 1px 0px 0px"}}
				style={{
					height:"50px",
					borderRadius:"10px",
					border:"1px solid black",
					padding:"10px",
					boxSizing:"border-box",
					boxShadow:"-3px 3px 0px 0px ",
					cursor:"pointer",
					backgroundColor:p.color,
					userSelect:"none",
					marginLeft:p.noMargin?"":"40px",
					marginBottom:p.b?"20px":""
				}}
			>
				{p.name}
				<div className="flex" style={{color:"white"}}>{p.leave}</div>
			</motion.div>
		)
	}

	function ChangeNameInput (p: {
		value               : string,
		form_type           : string,
		title               : string,
		setValue            : React.Dispatch<SetStateAction<string>>,
		hide_when_not_type? : number,
		channel_type?       : number
	}) {
		const [value, setValue] = useState("")
		const [buttonColor, setButtonColor] = useState("")
		const is_enabled = true;
		const Title = () => { return (<div className="flex w100"style={{color:is_enabled?"black":"#aaaaaa"}}>{p.title}</div>) }
		return (
			<div className="flex w100 col center ">
				<Title/>
				<div className="flex row w100 ">
					<input
						maxLength={20}
						className = "flex w100"
						disabled  = {false}
						value     = {value}
						type      = {p.form_type}
						onChange  = {(e)=>setValue(e.target.value)}
						style     = {{
							borderRadius:"10px",
							height:"50px",
							marginBottom:"20px",
							paddingLeft:"10px",
							border:"1px solid black",
						}}/>
					<Button color={buttonColor} setColor={setButtonColor} value={value} name={"Submit"}/>
				</div>
			</div>
		)
	}

	export default ChangeNameInput
