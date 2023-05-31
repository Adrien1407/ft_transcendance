
import React, { useEffect, useState } from "react";
import Frame from '../components/Frame'

import imgA from '@/assets/images/cupA.png'
import imgB from '../../assets/images/cupB.png'
import imgG from '../../assets/images/cupG.png'
import Cell from "../components/Cell";
import axios, { AxiosResponse } from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useMediaQuery } from "react-responsive";

type param = {
	display_name: string,
	login: string,
	img?: string,
	leaderboard_rank?: number,
	win?: number,
	lose?: number,
	elo?: number
}

let navigate :any;

const Anim 		= (p:{children:any, login : string}) => {
	return (
	<motion.div className='center' whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}
				onClick={()=> navigate('/userpage/'+p.login)}
				style={{cursor:'pointer'}}>{p.children}</motion.div>
	)
}


const CellWiner  = (p:param) => {
	navigate = useNavigate();
	const phone = useMediaQuery({maxWidth:415});
	const loadImg = (p:param) => {
		if (p.img !== undefined)
			return (<img style={{height:'100%'}} src={p.img} />)
		else
			return (
				<div className="PixelSaga center" style={{fontSize: phone ? '26px' : '33px'}}>
					#{p.leaderboard_rank}
				</div>
			)
	}
	return (
			<Cell margin="0 0 10px 0" width="100%" color="bgWhite" height="50px">
				<div className="flex w100 jcsa" style={{padding:'10`px 5px 5px 5px'}}>
					<div className="flex" style={{height:'50px', padding:'0px 0px'}}>
						{loadImg(p)}
					</div>
					<div className="flex col jcsa minw80 center">
						<Anim login={p.login}>
							<div className="PixelSaga center" style={{
																	border:'solid 1px black',
																	borderRadius:'10px',
																	padding:'1px 4px',
																	fontSize: phone ? '10px' : undefined}}>
								{p.display_name}
							</div>
						</Anim>
						<div className="PixelSaga flex jcsb">
							{/* win 10 loosses 10 */}
							<div className="PixelSaga textgreen" style={{fontSize: phone ? '10px' : '12px'}}
																		>Win : {p.win}</div>
							<div className="PixelSaga textred" style={{fontSize: phone ? '10px' : '12px',
																		margin:'0 7px 0 7px'}}
																		>Losses : {p.lose}</div>
							<div className="PixelSaga textred" style={{fontSize: phone ? '10px' : '12px'}}
																		>Elo : {p.elo}</div>
						</div>
					</div>
				</div>
			</Cell>
		)
	}
const AllMessagesContainer = ({children}:any) => <div id="messages" className="flex col w100 hideScrollBar absolute" style={{ height:"100%", maxHeight:"100%",overflowX:"auto"}}>{children}</div>

interface ReturnElo {
	number_of_win: number;
	number_of_lose: number;
	elo: number;
	leaderboard_rank: number;
	display_name: string;
	login: string;
}

function LadderPage()
{
	const [style, setStyle] = useState ({
		display:'flex',
		justifyContent:'center',
		backgroundColor:'red',
		fontFamily:'PixelSaga',
		padding:'10px 10px 10px 10px',
		opacity:1
	});

	const handleclick = () => {
		setStyle({
			...style,
			opacity: style.opacity === 1 ? 0 : 1
	});
	}

	// get axios nb match == i
	type getParam = {
		login : string,
		display_name: string,
		elo: number,
		leaderboard_rank: number,
		number_of_lose: number,
		number_of_win: number,
	}
	const [getLead, setGetLead] = useState<getParam[]>([]);
	useEffect(()=> {

	axios.get(`${import.meta.env.VITE_BACK_URL}/user/stats`)
		.then((res) => {
			setGetLead(res.data);
	})
	}, [])


	let a : JSX.Element[] = [];
	for (let i = 0; i < getLead.length; i++) {
		a.push(<CellWiner 	key={getLead[i].leaderboard_rank + i}
							display_name={getLead[i].display_name}
							login={getLead[i].login}
							elo={getLead[i].elo}
							leaderboard_rank={getLead[i].leaderboard_rank}
							win={getLead[i].number_of_win}
							lose={getLead[i].number_of_lose}></CellWiner>)
	}
	return (
		<Frame title="Leaderboard" titleImgLeft={imgG} titleImgRight={imgG} jcsb={false} jcsa={true}>
			<div className="flex col h100 w100 relative">
				<AllMessagesContainer>
					<div className="flex h90 w100 col">{a}</div>
				</AllMessagesContainer>
			</div>
		</Frame>
		)


}

export default LadderPage
