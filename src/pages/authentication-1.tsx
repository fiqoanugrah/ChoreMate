import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import axiosInstance from "../api/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      axiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.token}`;
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[350px] mx-auto">
        <div className="grid gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login to ChoreMate</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}