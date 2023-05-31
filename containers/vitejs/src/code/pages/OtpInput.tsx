import React from "react";
import Frame from '../components/Frame'
import axios from 'axios'
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// =============================================================================
// ----------------------------------- MAIN ------------------------------------
// =============================================================================

function OtpInput()
{
	const [input, setInput]  = useState<string>()
	let navigate = useNavigate();

	const config = {
		withCredentials : true,
		params: { totp: input }
	};

	function send(){
		axios.post(`${import.meta.env.VITE_BACK_URL}/auth/otp_validate`,null ,config)
		.then(res=>{
			navigate("/")
		})
		.catch(error=>alert("Wrong password"))
	}

	return (
		<Frame title="ENTER YOUR TOTP">

			<div className="flex fill center col">
				<input
					type="text"
					onChange={(e)=>{setInput(e.target.value)}}
					style={{padding:"10px"}}
				/>
				<div
					onClick={()=>send()}
					style={{
						backgroundColor:"#A3BE8C",
						borderRadius:"10px",
						padding:"10px",
						marginTop:"10px",
						cursor:"pointer"
					}}>Send</div>
			</div>
		</Frame>
	)
}

export default OtpInput
