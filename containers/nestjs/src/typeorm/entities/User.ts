
import { Channel } from "./Channel";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Message } from './message';
import { Ban } from "./Ban";
import { Match } from "./Match";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  login: string;

  @Column({ nullable: false, unique: true })
  displayName: string

  @Column({ nullable: false, default: 0 })
  state: number;

  @Column({ default: "https://commons.wikimedia.org/wiki/Commons:Quality_images/fr#/media/File:Gull_portrait_ca_usa.jpg" })
  picture: string;

  @Column({ nullable: false, default: false })
  otp_state: boolean;

  @Column({ nullable: true, default: null })
  otp_secret: string | null;

  @Column({ nullable: false, default: false })
  otp_verified: boolean;

  @Column({ nullable: true })
  last_connection_time : Date;


	@Column({ nullable: true })
	last_disconnection_time : Date;

  //#region Matchs

  @OneToMany(() => Match, m => m.winner)
  wins: Match[];

  @OneToMany(() => Match, m => m.loser)
  losses: Match[];

  @Column({default: 0})
  win_number: number;

  @Column({default: 0})
  loss_number: number;

  //#endregion

  //#region Channel
  @OneToMany(() => Message, (message) => message.user)
  messages: Message[]

  @ManyToMany(() => Channel, (channel) => channel.chanops)
  @JoinTable({
    name: "user_chanops",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "channel_id", referencedColumnName: "id" }
  })
  chanops: Channel[];

  @OneToMany(() => Ban, (ban) => ban.user)
  // @JoinTable({
  //   name: "user_ban",
  //   joinColumn: { name: "user_id", referencedColumnName: "id" },
  //   inverseJoinColumn: { name: "ban_id", referencedColumnName: "id" }
  // })
  bans: Ban[];
  //#endregion

  //#region Relations
  @ManyToMany(() => User, (user) => user.blocked_by)
  @JoinTable({
    name: "user_blocked",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "blocked_id", referencedColumnName: "id" }
  })
  blocked: User[];
  @ManyToMany(() => User, (user) => user.blocked)
  blocked_by: User[];

	@ManyToMany(() => Channel, (channel) => channel.users)
	@JoinTable({
		name: "user_channels",
		joinColumn: { name: "user_id", referencedColumnName: "id" },
		inverseJoinColumn: { name: "channel_id", referencedColumnName: "id" }
	})
	channels: Channel[];

  @ManyToMany(() => User, user => user.followed_by)
  @JoinTable({
    name: "user_following",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "followed_id", referencedColumnName: 'id'}
  })
  following: User[];

  @ManyToMany(() => User, user => user.following)
  followed_by: User[];

  // waiting_for_friend_accept: User[];
  //#endregion

  @Column({nullable: false, default: 1000})
  elo: number;

  @Column({nullable: true})
  current_game: string;
}
