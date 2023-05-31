import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // This controller has no arguments, so it targets /
export class AppController {
	constructor(private readonly appService: AppService) {}
	@Get()
	getHello(): string {
		return this.appService.getHello();
	}
	@Get('one') truc(): string {return "This is a testm @Controller() - @Get('one')"}
}

@Controller("test") // Targets url.com/test
export class AppTestController {
	constructor() {}
	@Get('one')   getThis():          string { return "This is a test - @Controller('test') - @Get('one')"}
	@Get(`two`)   getSomething():     string { return "This is a test - @Controller('test') - @Get('two')"}
	@Get(`three`) getSomethingElse(): string { return "This is a test - @Controller('test') - @Get('two')"}

	@Get /** Decorator **/ ('filter')
	methodName() /** NOTE seems to have no other use than info **/ : string /** return type **/
	{
		return "Hello World - filter ok"; // Method body
	}
}

@Controller("test") // Targets url.com/test
export class AppTestController2 {
	constructor(private readonly appService: AppService) {}

	@Get('user')
	getter ():string  {return this.appService.getThis();}
}

