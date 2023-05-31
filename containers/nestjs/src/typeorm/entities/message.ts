import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Channel } from './Channel';

import { User } from './User';


@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.messages)
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.messages)
  channel: Channel;

  @Column()
  is_pong_invite: boolean;

  @Column({nullable: true})
  game_id: string;

  @CreateDateColumn()
  created_at: Date;
}
