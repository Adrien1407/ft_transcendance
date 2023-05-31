import { Module } from "@nestjs/common";
import { ChatSocketModule } from "src/chat_socket/chat.module";
import { MatchModule } from "src/db/matchs/match.module";
import { MatchService } from "src/db/matchs/service/match.service";
import { UserModule } from "src/db/user/user.module";
import { GameGateway } from "./game.gateway";
import { Lobby } from "./lobby.service";
import { MatchManager } from "./match-manager.service";

@Module({
	imports: [UserModule, MatchModule, ChatSocketModule],
	controllers: [],
	providers: [GameGateway]
})
export class GameModule {}
