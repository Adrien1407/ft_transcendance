import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, ManyToMany } from 'typeorm';

import { User } from './User';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  score_winner: number;
  @Column()
  score_loser: number;

  @ManyToOne(() => User, user => user.wins)
  winner: User;

  @ManyToOne(() => User, user => user.losses)
  loser: User;
}
