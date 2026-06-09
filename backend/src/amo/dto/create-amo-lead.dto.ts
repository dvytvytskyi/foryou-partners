export class CreateAmoLeadDto {
  name: string;
  phone?: string;
  email?: string;
  budget?: number;
  comment?: string;
  city?: string;
  source?: string;
  tagIds?: number[];
  direction?: string;
  contactMethod?: string;
  partnerName?: string;
}
