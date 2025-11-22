export type Course = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  created_at: string;
};

export type Module = {
  id: number;
  course_id: number;
  title: string;
  order: number;
};

export type Lesson = {
  id: number;
  module_id: number;
  title: string;
  video_url: string | null;
  content: string | null;
  order: number;
};

// ... outros tipos que você precisar