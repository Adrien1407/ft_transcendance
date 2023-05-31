import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinTable, Timestamp, ManyToMany, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Message } from './message';
import { Ban } from './Ban';

@Entity()
export class Channel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string | null;

    @OneToMany(() => Message, (message) => message.channel)
    messages: Message[]

    @ManyToMany(() => User, (user) => user.channels)
    users: User[];

    @Column({
        default: 0
    })
    type: number;

    @Column({nullable: true})
    password: string | null;

    @ManyToOne(() => User, {nullable: true})
    owner: User;

    @ManyToMany(() => User, (user) => user.chanops)
    chanops: User[];

    @OneToMany(() => Ban, ban => ban.channel)
    bans: Ban[]

    @UpdateDateColumn({})
    last_update: Date;
}
