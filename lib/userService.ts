import { supabase } from "./supabaseClient";
import bcrypt from "bcryptjs";

// ตรวจสอบการโหลด SECRET_KEY จาก .env
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined in the environment variables.");
}

interface RegisterData {
  email: string;
  password: string;
  phone: string;
}

interface LoginData {
  email: string;
  password: string;
}

// ฟังก์ชันสำหรับการลงทะเบียนผู้ใช้
export async function registerUser({ email, password, phone }: RegisterData) {
  const saltRounds = 10; // เลือกระดับความปลอดภัยของ salt

  // hash รหัสผ่านก่อนเก็บ
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // เก็บข้อมูลผู้ใช้ในฐานข้อมูล
  const { data, error } = await supabase
    .from("users")
    .insert([{ email, password: hashedPassword, phone }]);

  if (error) {
    alert("ไม่สามารถสมัครสมาชิกได้");
    throw new Error(error.message);
  }

  return data;
}

// ฟังก์ชันสำหรับการเข้าสู่ระบบ
export async function loginUser({ email, password }: LoginData) {
  // ดึงข้อมูลผู้ใช้จากฐานข้อมูลตามอีเมล
  const { data: user, error } = await supabase
    .from("users")
    .select()
    .eq("email", email)
    .single();

  if (error || !user) {
    alert("ไม่สามารถเข้าสู่ระบบได้");
    throw new Error(error?.message || "User not found");
  }

  // เช็คว่า รหัสผ่านที่กรอกตรงกับ hash ที่เก็บไว้ในฐานข้อมูลหรือไม่
  const isValid = await bcrypt.compare(password, user.password); // user.password คือ hash
  if (!isValid) {
    alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    throw new Error("Invalid credentials");
  }
  // เก็บข้อมูลการเข้าสู่ระบบใน localStorage
  localStorage.setItem("isLogin", "true");
  return user;
}
