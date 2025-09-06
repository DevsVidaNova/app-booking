
export interface ScaleInput {
  date: string;
  band?: string;
  name: string;
  description?: string;
  projection?: string;
  light?: string;
  transmission?: string;
  camera?: string;
  live?: string;
  sound?: string;
  training_sound?: string;
  photography?: string;
  stories?: string;
  dynamic?: string;
  direction: string;
}

export interface DirectionData {
  id: string;
  full_name: string;
}

export interface BandData {
  id: string;
  full_name: string;
}

export interface Scale {
  id: string;
  date: string;
  name: string;
  description?: string;
  direction?: DirectionData;
  band?: BandData;
  projection?: string;
  light?: string;
  transmission?: string;
  camera?: string;
  live?: string;
  sound?: string;
  training_sound?: string;
  photography?: string;
  stories?: string;
  dynamic?: string;
}
