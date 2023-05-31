import { ArgumentsHost, Catch, HttpException, Logger } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

@Catch(HttpException)
export class WsDtoFilter extends BaseWsExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost): void {
		Logger.debug("WsDtoFilter: " + JSON.stringify(exception.getResponse()));
		super.catch(new WsException(exception.getResponse()), host);
	}
}
