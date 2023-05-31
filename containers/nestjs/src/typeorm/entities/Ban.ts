import { Column, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { Channel } from "./Channel";
import { User } from "./User";

@Entity()
export class Ban {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.bans)
	user: User

	@ManyToOne(() => Channel, (channel) => channel.bans)
	channel: Channel

	@Column()
	type: number;

	@Column()
	ban_time: Date;
}
