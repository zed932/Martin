export interface TheorySection {
  id: string;
  topic: 'calculator' | 'sets' | 'matrices';
  title: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface TheoryFormData {
  topic: 'calculator' | 'sets' | 'matrices';
  title: string;
  content: string;
  order: number;
  isActive: boolean;
}
