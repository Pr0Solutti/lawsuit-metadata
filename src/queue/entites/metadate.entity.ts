import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity('metadata')
export class Metadata {
  @PrimaryColumn({ unique: true })
  numero: string;

  @Column()
  classe: string;

  @Column()
  tribunal: string;

  @Column({ type: 'datetime' })
  dataAjuizamento: Date;

  @Column({ type: 'float' })
  sigilo: number;

  // Para arrays, usamos JSON ou outra tabela relacional
  @Column({ type: 'json' })
  assuntos: string[];

  @Column({ type: 'varchar', nullable: true })
  orgaoJulgador: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
