export interface TheorySection {
  id: string;
  topic: 'calculator' | 'sets' | 'matrices';
  title: string;
  content: string; // HTML контент
  order: number; // Порядок отображения
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Дополнительные интерфейсы для расширения
export interface TheoryTopic {
  id: string;
  name: string;
  description: string;
  icon: string; // Иконка для UI
  route: string; // Маршрут калькулятора
}

// Для административной части
export interface TheoryUpdateDto {
  topic: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
}
