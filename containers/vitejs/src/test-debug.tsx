// function Welcome(props: { name?: string, oui?: string, nb?: number}) {
// 	if (props.oui == undefined)
// 		var oui = "Hello"
// 	else
// 		oui = props.oui
// 	var nb: number;
// 	(props.nb == undefined) ? nb = 0 : nb = props.nb
// 	console.log(typeof props.nb)
// 	return (
// 			<h1>{oui}, {props.name} age : {nb}</h1>
// 		)
//   }

//   function Hello() {
// 	return (
// 	  <div>
// 		<Welcome name="Sara" nb={10} />
// 		<Welcome name="Cahal" />
// 		<Welcome name="Edite" />
// 		<Welcome name="wil" oui="olleh"   />
// 	  </div>
// 	);
//   }

// type Props = PropsWithChildren<{
// 	start: number,
// 	title?: ReactNode
// }>

// const GetLength = (obj: string): number => {
// 	return (obj.length)
// }

// function Test({start, children, title="Titre"}: Props) {
// // function Test(props: {start:number, children:any}) {
// 	const [n, setN] = useState<number>(GetLength("PixelSaga"))
// 	const increment = () => setN(n => n + 1)

// console.log(title)

// 	return (
// 		<div className="flex bgBlack w100 h100 center jcsa">
// 			{title}
// 			<div className="PixelSaga flex w48 textWhite">
// 				<motion.button
// 					whileHover={{ scale: 1.2 }}
// 					whileTap={{ scale: 0.8 }}
// 					onClick={increment}
// 				>
// 					{children}
// 				</motion.button>
// 			</div>
// 			<div className="PixelSaga flex w48 textWhite col center">
// 				{n}
// 				<Hello/>
// 			</div>
// 		</div>
// 	)
// }


// function title({children}: PropsWithChildren) {
	// 	return (
		// 		<h1 className="PixelSaga">{children}</h1>
		// 	)
		// }
