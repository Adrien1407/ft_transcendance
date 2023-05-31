import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getHello():         string { return 'Hello World!'; }
	getThis():          string { return "This is a test - @Controller('test') - @Get('one')"}
	getSomething():     string { return "This is a test - @Controller('test') - @Get('two')"}
	getSomethingElse(): string { return "This is a test - @Controller('test') - @Get('two')"}
}
