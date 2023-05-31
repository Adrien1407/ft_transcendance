import Frame         from "@/components/Frame"
import goBack        from '@/assets/square_chev_left.svg'
import axios, { AxiosError }         from "axios"
import {motion}      from 'framer-motion'
import {SetStateAction, useState}    from "react"
import {useNavigate} from "react-router"
import {useContext}  from "react"
import {ChatSocket}  from '@/src/main'
import * as socket   from "@/utils/socket"

function Input (p: {data: string, form_type: string, title: string, setValue: React.Dispatch<SetStateAction<string>>, hide_when_not_type?: number, channel_type?: number}) {
	const is_enabled = p.channel_type === 1 || p.title === "Channel Name";
	return (
		<div className="flex col w100 center">
			<div className="flex w40"style={{color:is_enabled?"black":"#aaaaaa"}}>{p.title}</div>
			<input
				maxLength={20}
				disabled={is_enabled?false:true}
				className="flex tac w40"
				value={p.data}
				type={p.form_type}
				name="name"
				onChange={(e)=>p.setValue(e.target.value)}
				style={{
					borderRadius:"10px",
					height:"50px",
					marginBottom:"20px",
					border:"1px solid black",
				}}/>
		</div>
	)
}


export default function CreateChannel () {

	const chatSocket = useContext(ChatSocket)
	const navigate   = useNavigate()

	const [name,    setName]    = useState("")
	const [type,    setType]    = useState(0)
	const [pass,    setPass]    = useState("")
	const [error,   setError]   = useState("")
	const [loading, setLoading] = useState("")
	const [confirm, setConfirm] = useState("")


	function Radio (p: {type: number, label: string}) {
		return (
			<div className="flex w100">
				<div className="flex"
					onClick={()=>{setType(p.type)}}
					style={{
						minWidth:"20px",
						minHeight:"20px",
						backgroundColor:p.type === type ?"black": "white",
						border:"1px solid black",
						margin:"0 10px 20px 0",
						borderRadius:"4000px"
					}}>
				</div>
				<div className="flex w100">
					{p.label}
				</div>
			</div>
		)
	}

	function RadioGroup(p:any) {
		return (
			<div className="center w100 col">
				<div className="flex w40" style={{paddingBottom:"0px"}}>Select channel type</div>
				<div className="flex w40 col jcc"
					style={{
						boxSizing:"border-box",
						backgroundColor:"white",
						padding:"20px 0 0 10px",
						borderRadius:"10px",
						border:"1px solid black",
						marginBottom:"20px"
					}}>
					<Radio type={0} label={"Public"}/>
					<Radio type={1} label={"Password"}/>
					<Radio type={2} label={"Private"}/>
				</div>
			</div>
		)
	}

	function Submit () {
		function createChannel(){
			if (pass === confirm || type != 1) {
				if (name.length) {
					socket.createChannel({
						socket: chatSocket,
						name : name,
						type : type,
						password : pass,
						callback(res) {
							if (res) {
								navigate(`/channelchat/${res}`)
							} else {
								setError('Couldn\'t create channel');
							}
						},
					})
				}
				else { setError("You must specify a name") }
			}
			else { setError("Passwords do not match") }
		}
		return (
			<div className="w100 center">
				<motion.div className="flex"
					initial={true}
					onClick={()=>{createChannel()}}
					whileTap={{x:"-3px", y:"3px", boxShadow:"-1px 1px 0px 0px"}}
					style={{
						borderRadius:"10px",
						border:"1px solid black",
						padding:"10px",
						boxShadow:"-3px 3px 0px 0px ",
						cursor:"pointer"
					}}
				>
					Create channel
				</motion.div>
			</div>
		)
	}

	return (
		<Frame title="Create Channel" titleImgLeft={goBack} hrefLeft="/landing" chat={true}>

			<div className="flex fill relative">
			<div className="flex fill col absolute" style={{ height:"100%", maxHeight:"100%",overflowX:"auto"}}>
				<Input      setValue={setName}    form_type={"text"}     data={name}    title="Channel Name"/>
				<Input      setValue={setPass}    form_type={"password"} data={pass}    title="Password" channel_type={type} />
				<Input      setValue={setConfirm} form_type={"password"} data={confirm} title="Confirm Password" channel_type={type} />
				<RadioGroup setType={setType}     type={type}/>
				<Submit/>
				<div className="flex" style={{height:"15px", paddingTop:"20px", color:error?"red":"black"}}>
					{error && "Error: "}{error}
					{!error && loading}
				</div>
			</div>
			</div>
		</Frame>
	)
}
