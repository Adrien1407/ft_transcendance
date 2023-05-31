import { relative } from "path";
import React from "react"
import { useNavigate } from "react-router";

// NOTE Color is passed as a className, not a style
type cellSettings = {
	height?    : string;
	minHeight? : string;
	opacity?   : number;
	maxHeight? : string;
	width?     : string;
	color?     : string;
	children?  : React.ReactNode;
	direction? : string;
	radius?    : number;
	fontSize?  : string;
	padding?   : string;
	paddingLeft?   : string;
	paddingRight?   : string;
	margin?    : string;
	font?      : string;
	center?    : boolean;
	jcsa?	   : boolean;
	border?	   : boolean;
	href?	   : string;
	cursor?    : string;
	navigating?: string;
}

function Cell(settings : cellSettings )
{
	let navigate = useNavigate();
	let radius   = 10;
	let fontSize = "15px"
	let center   = "center"
	let font     = "PixelSaga"
	let jcsa	 = "jcsa"
	let border	 = ""
	if (settings.radius   !== undefined) radius   = settings.radius;
	if (settings.fontSize !== undefined) fontSize = settings.fontSize;
	if (settings.font     !== undefined) font     = settings.font;
	if (settings.center   === false) center   = "";
	if (settings.jcsa     === false) jcsa     = "";
	if (settings.border     === true) border     = "1px solid black";

	function handleClick() {
		if (settings.navigating) {
			navigate(settings.navigating)
		}
	}

	return (
		<div
			className={`
				PixelSaga
				flex
				${center}
				${settings.direction}
				${settings.color}
				${jcsa}
				`}

			style={{
				borderRadius : radius,
				fontSize     : fontSize,
				height       : settings.height,
				maxHeight    : settings.maxHeight,
				width        : settings.width,
				padding      : settings.padding,
				paddingLeft  : settings.paddingLeft,
				paddingRight : settings.paddingRight,
				margin       : settings.margin,
				border		 : border,
				opacity	     : settings.opacity,
				minHeight    : settings.minHeight,
				cursor		 : settings.cursor,
			}}
		>
				{(settings.href !== undefined) ?
					<a href={settings.href}> {settings.children} </a> :
					(settings.navigating !== undefined) ?
						<div onClick={handleClick}>{settings.children}</div> :
						<> {settings.children}</>}
		</div>
	)
}

export default Cell
