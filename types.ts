export enum UserRole {
  STUDENT = 'Student',
  FACULTY = 'Faculty',
  AUTHORITY = 'Authority',
  ADMIN = 'Admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  cgpa?: number;
}

export enum GrievanceStatus {
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'Under Review',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

export interface Grievance {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  status: GrievanceStatus;
  date: string;
  description: string;
  location?: string;
  votes: number;
  created_at: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  attendance: number;
  totalClasses: number;
}

export interface Opportunity {
  id: string;
  title: string;
  professor: string;
  type: 'Internship' | 'Research' | 'Project';
  deadline: string;
  stipend?: string;
  tags: string[];
}

export interface Resource {
  id: string;
  title: string;
  type: string;
  size: string;
  uploaded_by: string;
  url?: string;
}

export interface Assignment {
  id: string;
  title: string;
  course_code: string;
  due_date: string;
  type: string;
}

export interface SystemStatus {
  id: string;
  name: string;
  status: string;
  health: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  roles: UserRole[];
}

export interface MapLocation {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  description: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  likes: number;
  is_flagged: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
}