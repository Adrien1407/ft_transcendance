import React from "react"
import Frame from "@/components/Frame"
import Pong from "@/components/pong/App"
import { useState } from "react"
import { useEffect } from "react"
import * as socket from '@/utils/socket'
import { Socket } from "socket.io-client"
import { useRef } from "react"
import { title } from "process"
import square_question from '@/assets/square_question.svg'
import arrowUp from '@/assets/square_chev_up.svg'
import arrowDown from '@/assets/square_chev_down.svg'
import { useMediaQuery } from "react-responsive"

const PongGame = (p:{keyBoard:string}) => {
	console.log(p.keyBoard)
	const pongRef = useRef<HTMLDivElement>(null);

	const pressKey = () => {
		const eventKeyDown = new KeyboardEvent("keydown", { key: p.keyBoard });
    	const eventKeyUp = new KeyboardEvent("keyup", { key: p.keyBoard });
		window.dispatchEvent(eventKeyDown);
		setTimeout(() => {
			window.dispatchEvent(eventKeyUp);
		  }, 100);
	};

	const downKey = () => {
		const event = new KeyboardEvent('keydown', {key:p.keyBoard});
		window.dispatchEvent(event);
	}

	const upKey = () => {
		const event = new KeyboardEvent('keyup', {key:p.keyBoard});
		window.dispatchEvent(event);
	}

	let style = {
		backgroundColor:'white',
		opacity:0.2,
		borderRadius:'10px',
	}

	return (
		<div ref={pongRef} tabIndex={0}>
			<button>
			<img		src={p.keyBoard === 'w' ? arrowUp : arrowDown}
						onClick={pressKey}
						onMouseDown={downKey}
						onTouchStart={downKey}
						onMouseUp={upKey}
						onTouchEnd={upKey}
						style={style}
							/></button>
		</div>
	);
  };

const PongInterface = (p: {title?: string, id?: number}) => {
	// -----------------------------------------------------
	// ---------------------- SOCKET -----------------------
	// -----------------------------------------------------
	const phoneForButton = useMediaQuery({maxWidth:450});
	const [inQ, setInQ] = useState<boolean>(false)
	const [inGame, setInGame] = useState<boolean>(false)
	const [isCustom, setIsCustom] = useState<boolean>(false)
	const [chaussette, setChaussette] = useState<Socket>()
	useEffect(()=>{
		const gameSocket = socket.connectToGameSocket()
		setChaussette(gameSocket)
		return (()=>{
			console.log('GameSocket closed')
			gameSocket.disconnect()
			gameSocket.off('connect')
			gameSocket.off('disconnect')
		})
	}, [])

	// -----------------------------------------------------
	// ------------------ RESIZE HANDLER -------------------
	// -----------------------------------------------------
	const [h, setH] = useState(0);
	const [w, setW] = useState(0);
	const ref = useRef<any>()
	useEffect(()=>{
		function handleResize() {
			if(ref.current){
				setH(ref.current.offsetHeight)
				setW(ref.current.offsetWidth)
			}
		}
		setTimeout(() =>  handleResize(), 100)
		//window.addEventListener('resize', handleResize);
		//return () => window.removeEventListener('resize', handleResize);
	}, [ref.current])

	// -----------------------------------------------------
	// --------------------- JOIN GAME ---------------------
	// -----------------------------------------------------
	const gameSocket = chaussette;
	if (!gameSocket) {return <Frame/>}
	function joinQueue() {
		if (gameSocket) {
			if (inQ == false) {
				if (!p.id) {
					if (!isCustom) {
						gameSocket.emit("client.random_game")
					} else {
						gameSocket.emit("client.custom_random_game")
					}
				} else {
					if (!isCustom) {
						gameSocket.emit("client.precise_game", {uuid: p.id.toString()})
					} else {
						gameSocket.emit("client.custom_precise_game", {uuid: p.id.toString()})
					}
				}
			} else {
				gameSocket.emit('client.leave_queue')
				gameSocket.emit('client.leave_game')
			}
			setInQ(!inQ)
		}
	}
	// -----------------------------------------------------
	// ----------------------- HTML ------------------------
	// -----------------------------------------------------
	console.log(h)
	console.log(w)
	return (
		<Frame title={p.title} titleImgRight={square_question} chat={true} modal={true}>
			<br/>
			<div  className="flex col fill center">
				<div ref={ref} id="" className="flex h90 w90 center">
					{ w !== 0 && h !== 0 && <div className="flex col w100 center" style={{justifyContent: 'flex-end' }}>
									<Pong in_queue={setInQ} in_game={setInGame} socket={gameSocket} size_x={w} size_y={h} custom_mode={isCustom}/>

									<div className="flex row w30 jcsa absolute" style={{marginBottom:'10px'}}>
										<div className='no-select' style={{transform:'translate(0%, 0%)'}}>
											<PongGame keyBoard='s'/>
										</div>
										<div className='no-select' style={{transform:'translate(0%, 0%)'}}>
											<PongGame keyBoard='w'/>
										</div>
									</div>

								</div>}
				</div>
				{!inGame && <div  className="flex h10 w80 center">
					 <div
						onClick={()=>joinQueue()}
						style={{
							borderRadius:"10px",
							padding:"10px",
							cursor:"pointer",
							backgroundColor: inQ ? "#2e9937" : "#fabd2f"
						}}>
						Join Queue
					</div>
					<div className="w10"/>
					 <div
						onClick={()=>{!inQ ? setIsCustom(!isCustom) : {}}}
						style={{
							borderRadius:"10px",
							padding:"10px",
							cursor:"pointer",
							backgroundColor:isCustom ? "#2e9937" : "#fabd2f",
						}}>
						Custom Game
					</div>
				</div>

				}
			</div>
		</Frame>
	)
}
export default PongInterface
