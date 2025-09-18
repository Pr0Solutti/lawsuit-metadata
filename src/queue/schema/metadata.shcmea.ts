import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
class Lawsuit {
  @Prop({ required: true })
  numero: string;

  @Prop({ required: true })
  classe: string;

  @Prop({ required: true })
  tribunal: string;

  @Prop({ required: true })
  dataAjuizamento: Date;

  @Prop({ required: true })
  sigilo: string;

  @Prop({ type: [String], required: true })
  assuntos: string[];

  @Prop({ required: true })
  orgaojulgador: string;
}

type LawsuitDocument = Lawsuit & Document;
const LawsuitSchema = SchemaFactory.createForClass(Lawsuit);
export { Lawsuit, LawsuitSchema, LawsuitDocument };
