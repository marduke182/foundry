export type OnClick = (e: UIEvent) => void;

export interface Button {
  id: string;
  label: string;
  icon: string;
  class: string;
  onclick: OnClick;
}

export interface ApplicationWithObject<T extends any> extends Application {
  object: T;
}

export type CompendiumType = 'Item' | 'JournalEntry';

export interface ItemGTData {
  name: string;
  description: string;
}
